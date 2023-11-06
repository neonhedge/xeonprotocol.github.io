console.clear();

//our globals, dont move moon breaks inside IDK why
window.moon;

document.addEventListener('DOMContentLoaded', function () {
    
    // initializing our cityscape script here
    // https://blog.spoongraphics.co.uk/videos/video-tutorial-isometric-city-illustration-in-adobe-illustrator
    var tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });
    tl.to(".HOVA-car", { duration: 0.5, opacity: 1 });
    tl.to(".HOVA-car", { duration: 7, y: -350, x: 600, ease: "none" }, "<");
    tl.to(".HOVA-car", { duration: 1, opacity: 0 });

    // initialize header landscape
    ww = window.innerWidth;
    wh = window.innerHeight;

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas: document.querySelector('canvas')
    });

    renderer.setSize(ww, wh);
    renderer.setClearColor(0x001a2d);

    // Declare scene as a global variable
    scene = new THREE.Scene();

    scene.fog = new THREE.Fog(0x001a2d, 80, 140);
    camera = new THREE.PerspectiveCamera(45, ww / wh, 0.1, 200);
    camera.position.x = 70;
    camera.position.y = 30;
    camera.position.z = 5;
    camera.lookAt(new THREE.Vector3());

    // var controls = new THREE.OrbitControls(camera, renderer.domElement);

    /* LIGHTS */
    moonLight = new THREE.PointLight(0xffffff, 2, 150);
    scene.add(moonLight);

    window.stars = new THREE.Group();
    scene.add(stars);
    starsLights = new THREE.Group();
    scene.add(starsLights);
    window.starsAmount = 8;

    createMoon();
    createTerrain();
    createStars();
    requestAnimationFrame(render);
});

function createMoon() {
    var geometry = new THREE.SphereGeometry(8, 32, 32);
    var material = new THREE.MeshPhongMaterial({
        color: 0x26fdd9,
        shininess: 15,
        emissive: 0x2bb2e6,
        emissiveIntensity: 0.8
    });
    moon = new THREE.Mesh(geometry, material);
    moon.position.x = -9;
    moon.position.z = -6.5;
    moon.position.y = 2;
    moon.rotation.y = -1;
    scene.add(moon);
    moonLight.position.copy(moon.position);
    moonLight.position.y += 4;
    var moonLight2 = new THREE.PointLight(0xffffff, 0.6, 150);
    scene.add(moonLight2);
    moonLight2.position.x += 20;
    moonLight2.position.y -= 20;
    moonLight2.position.z -= 25;
}

function createTerrain() {
    var geometry = new THREE.PlaneGeometry(150, 150, 120, 120);
    var m = new THREE.Matrix4();
    m.makeRotationX(Math.PI * -0.5);
    geometry.applyMatrix(m);
    for (var i = 0; i < geometry.vertices.length; i++) {
        var vector = geometry.vertices[i];
        var ratio = noise.simplex3(vector.x * 0.03, vector.z * 0.03, 0);
        vector.y = ratio * 10;
    }
    var material = new THREE.MeshPhongMaterial({
        color: 0x198257,
        emissive: 0x032f50
    });
    var plane = new THREE.Mesh(geometry, material);
    scene.add(plane);
}



function createStars() {
    var geometry = new THREE.SphereGeometry(0.2, 16);
    var material = new THREE.MeshBasicMaterial({ color: 0x7e22ce });
    for (var i = 0; i < starsAmount; i++) {
        var star = new THREE.Mesh(geometry, material);
        star.position.x = (Math.random() - 0.5) * 150;
        star.position.z = (Math.random() - 0.5) * 150;
        var ratio = noise.simplex3(star.position.x * 0.03, star.position.z * 0.03, 0);
        star.position.y = ratio * 10 + 0.3;
        stars.add(star);
        var velX = (Math.random() + 0.1) * 0.1 * (Math.random() < 0.5 ? -1 : 1);
        var velY = (Math.random() + 0.1) * 0.1 * (Math.random() < 0.5 ? -1 : 1);
        star.vel = new THREE.Vector2(velX, velY);
        var starLight = new THREE.PointLight(0xa824d7, 0.8, 3);
        starLight.position.copy(star.position);
        starLight.position.y += 0.5;
        starsLights.add(starLight);
    }
}

function updateStar(star, index) {
    star.position.x += star.vel.x;
    star.position.z += star.vel.y;

    // Adjust the vertical position of stars based on a sine wave pattern
    var time = performance.now() * 0.001; // Use the current time for animation
    var verticalOffset = Math.sin(time + index) * 2; // Adjust the factor as needed
    star.position.y = verticalOffset;

    // Wrap stars around the scene when they go out of bounds
    if (star.position.x < -75) {
        star.position.x = 75;
    }
    if (star.position.x > 75) {
        star.position.x = -75;
    }
    if (star.position.z < -75) {
        star.position.z = 75;
    }
    if (star.position.z > 75) {
        star.position.z = -75;
    }

    starsLights.children[index].position.copy(star.position);
    starsLights.children[index].position.y += 0.5;
}

// Set lasttimestamp global
window.lastTimestamp = 0;

// rendering loop function
function render(currentTimestamp) {
    const targetFPS = 20;
    const frameDelay = 1000 / targetFPS;
    const elapsed = currentTimestamp - window.lastTimestamp;

    // Only render a frame if enough time has passed
    if (elapsed >= frameDelay) {
        window.lastTimestamp = currentTimestamp;

        for (var i = 0; i < starsAmount; i++) {
            updateStar(stars.children[i], i);
        }
        renderer.render(scene, camera);
    }

    // Request the next frame
    requestAnimationFrame(render);
}

function onResize() {
    ww = window.innerWidth;
    wh = window.innerHeight;
    camera.aspect = ww / wh;
    camera.updateProjectionMatrix();
    renderer.setSize(ww, wh);
}

window.addEventListener('resize', onResize);
