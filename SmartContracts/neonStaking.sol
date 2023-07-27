// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract StakingContract is Ownable {
    using SafeMath for uint256;

    IERC20 public neonToken;
    uint256 public stakingDuration = 30 days;
    uint256 public rewardDistributionDay; // The day when the owner distributes rewards.
    uint256 public nextUnstakeDay; // The day when stakers can unstake again.

    struct Staker {
        uint256 amount;
        uint256 stakingTime;
        uint256 lastClaimedDay;
        uint256 assignedForMining;
        uint256 assignedForLiquidity;
        uint256 assignedForCollateral;
    }

    mapping(address => Staker) public stakers;

    event Staked(address indexed staker, uint256 amount);
    event Unstaked(address indexed staker, uint256 amount);
    event TokensAssigned(address indexed staker, uint256 amountForMining, uint256 amountForLiquidity, uint256 amountForCollateral);
    event TokensUnassigned(address indexed staker, uint256 amountFromMining, uint256 amountFromLiquidity, uint256 amountFromCollateral);
    event RewardClaimed(address indexed staker, uint256 amount);
    event RewardsDistributed(uint256 amount);

    modifier stakingAllowed() {
        require(block.timestamp >= nextUnstakeDay, "Staking is not allowed at the moment.");
        _;
    }

    modifier claimAllowed() {
        require(rewardDistributionDay > 0 && block.timestamp >= rewardDistributionDay.add(1 days), "Reward claim is not allowed at the moment.");
        _;
    }

    constructor(address _neonToken) {
        require(_neonToken != address(0), "Invalid token address.");
        neonToken = IERC20(_neonToken);
    }

    function stake(uint256 _amount) external stakingAllowed {
        require(_amount > 0, "Staked amount must be greater than zero.");
        require(stakers[msg.sender].amount == 0, "You can only stake once at a time.");

        stakingToken.transferFrom(msg.sender, address(this), _amount);

        stakers[msg.sender] = Staker({
            amount: _amount,
            stakingTime: block.timestamp,
            lastClaimedDay: rewardDistributionDay,
            assignedForMining: 0,
            assignedForLiquidity: 0,
            assignedForCollateral: 0
        });

        emit Staked(msg.sender, _amount);
    }

    function unstake() external stakingAllowed {
        Staker storage staker = stakers[msg.sender];
        require(staker.amount > 0, "You have no staked tokens.");

        uint256 stakingEndTime = staker.stakingTime.add(stakingDuration);
        require(block.timestamp >= stakingEndTime, "You can't unstake until the stake matures.");

        uint256 amountToUnstake = staker.amount;
        staker.amount = 0;

        neonToken.transfer(msg.sender, amountToUnstake);

        emit Unstaked(msg.sender, amountToUnstake);
    }

    function assignTokens(uint256 _percentForMining, uint256 _percentForLiquidity, uint256 _percentForCollateral) external {
        Staker storage staker = stakers[msg.sender];
        require(staker.amount > 0, "You have no staked tokens.");
        require(_percentForMining.add(_percentForLiquidity).add(_percentForCollateral) <= 100, "Total assigned percentage cannot exceed 100%.");

        uint256 totalStakedAmount = staker.amount;

        // Calculate the unassigned amount.
        uint256 totalAssignedAmount = staker.assignedForMining.add(staker.assignedForLiquidity).add(staker.assignedForCollateral);
        uint256 unassignedAmount = totalStakedAmount.sub(totalAssignedAmount);

        // Calculate the new assigned amounts based on the provided percentages.
        uint256 newAssignedForMining = unassignedAmount.mul(_percentForMining).div(100);
        uint256 newAssignedForLiquidity = unassignedAmount.mul(_percentForLiquidity).div(100);
        uint256 newAssignedForCollateral = unassignedAmount.mul(_percentForCollateral).div(100);

        // Update the assigned percentages for Mining, liquidity, and collateral.
        staker.assignedForMining = staker.assignedForMining.add(newAssignedForMining);
        staker.assignedForLiquidity = staker.assignedForLiquidity.add(newAssignedForLiquidity);
        staker.assignedForCollateral = staker.assignedForCollateral.add(newAssignedForCollateral);

        emit TokensAssigned(msg.sender, staker.assignedForMining, staker.assignedForLiquidity, staker.assignedForCollateral);
    }

    function unassignTokens(uint256 _amountFromMining, uint256 _amountFromLiquidity, uint256 _amountFromCollateral) external {
        Staker storage staker = stakers[msg.sender];
        require(staker.amount > 0, "You have no staked tokens.");

        // Ensure that the unassigning amounts are not greater than the assigned amounts.
        require(staker.assignedForMining >= _amountFromMining, "Unassign amount exceeds assigned for Mining.");
        require(staker.assignedForLiquidity >= _amountFromLiquidity, "Unassign amount exceeds assigned for liquidity.");
        require(staker.assignedForCollateral >= _amountFromCollateral, "Unassign amount exceeds assigned for collateral.");

        // Update the assigned percentages for Mining, liquidity, and collateral.
        staker.assignedForMining = staker.assignedForMining.sub(_amountFromMining);
        staker.assignedForLiquidity = staker.assignedForLiquidity.sub(_amountFromLiquidity);
        staker.assignedForCollateral = staker.assignedForCollateral.sub(_amountFromCollateral);

        emit TokensUnassigned(msg.sender, _amountFromMining, _amountFromLiquidity, _amountFromCollateral);
    }

    function depositRewards() external payable onlyOwner {
        require(msg.value > 0, "Reward amount must be greater than zero.");
        emit RewardsDistributed(msg.value);
    }

    function distributeRewards() external onlyOwner {
        require(rewardDistributionDay == 0 || block.timestamp >= rewardDistributionDay.add(30 days), "You can distribute rewards once every 30 days.");

        uint256 totalRewards = address(this).balance;
        require(totalRewards > 0, "No rewards available to distribute.");

        rewardDistributionDay = block.timestamp;
        nextUnstakeDay = block.timestamp.add(30 days);

        uint256 totalStaked = getTotalStaked();

        for (address stakerAddress in getStakers()) {
            Staker storage staker = stakers[stakerAddress];
            uint256 stakerDays = block.timestamp.sub(staker.stakingTime).div(1 days);

            // Calculate the staker's share of rewards based on the number of days staked.
            uint256 stakerRewardShare = totalRewards.mul(staker.amount).mul(stakerDays).div(stakingDuration).div(totalStaked);

            // Increment staker's lastClaimedDay to the reward distribution day.
            staker.lastClaimedDay = rewardDistributionDay;

            // Transfer the reward share to the staker's address.
            payable(stakerAddress).transfer(stakerRewardShare);

            emit RewardClaimed(stakerAddress, stakerRewardShare);
        }
    }

    function claimRewards() external claimAllowed {
        Staker storage staker = stakers[msg.sender];
        require(staker.amount > 0, "You have no staked tokens.");
        require(staker.lastClaimedDay < rewardDistributionDay, "You have already claimed your rewards for this distribution.");

        uint256 stakerDays = block.timestamp.sub(staker.stakingTime).div(1 days);
        uint256 stakerRewardShare = address(this).balance.mul(staker.amount).mul(stakerDays).div(stakingDuration).div(getTotalStaked());

        staker.lastClaimedDay = rewardDistributionDay;

        payable(msg.sender).transfer(stakerRewardShare);

        emit RewardClaimed(msg.sender, stakerRewardShare);
    }

    function getRewardsDue() external view returns (uint256) {
        Staker storage staker = stakers[msg.sender];
        uint256 stakerDays = block.timestamp.sub(staker.stakingTime).div(1 days);

        if (staker.amount == 0 || staker.lastClaimedDay >= rewardDistributionDay) {
            return 0;
        }

        uint256 stakerRewardShare = address(this).balance.mul(staker.amount).mul(stakerDays).div(stakingDuration).div(getTotalStaked());
        return stakerRewardShare;
    }

    function getAssignedAndUnassignedAmounts(address stakerAddress) external view returns (uint256 assignedForMining, uint256 assignedForLiquidity, uint256 assignedForCollateral, uint256 unassigned) {
        Staker storage staker = stakers[stakerAddress];
        uint256 totalStakedAmount = staker.amount;
        uint256 totalAssignedAmount = staker.assignedForMining.add(staker.assignedForLiquidity).add(staker.assignedForCollateral);
        uint256 unassignedAmount = totalStakedAmount.sub(totalAssignedAmount);
        return (staker.assignedForMining, staker.assignedForLiquidity, staker.assignedForCollateral, unassignedAmount);
    }

    function getStakedBalance(address stakerAddress) external view returns (uint256) {
        return stakers[stakerAddress].amount;
    }

    function getTotalStaked() internal view returns (uint256) {
        return neonToken.balanceOf(address(this));
    }

    function getStakers() internal view returns (address[] memory) {
        address[] memory stakerAddresses = new address[](getTotalStakers());
        uint256 index = 0;

        for (address stakerAddress in stakers) {
            stakerAddresses[index] = stakerAddress;
            index++;
        }

        return stakerAddresses;
    }

    function getTotalStakers() internal view returns (uint256) {
        uint256 totalStakersCount = 0;

        for (address stakerAddress in stakers) {
            if (stakers[stakerAddress].amount > 0) {
                totalStakersCount++;
            }
        }

        return totalStakersCount;
    }
}
