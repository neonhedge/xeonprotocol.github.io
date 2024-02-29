console.clear();

let moon;
let ww, wh;
let renderer, scene, camera, moonLight, stars, starsLights, starsAmount = 1;
let lastTimestamp = 0;

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.querySelector('canvas');
  ww = window.innerWidth;
  wh = window.innerHeight;

  renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
  renderer.setSize(ww, wh);
  renderer.setClearColor(0x001a2d);

  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x001a2d, 80, 140);
  camera = new THREE.PerspectiveCamera(45, ww / wh, 0.1, 200);
  camera.position.set(70, 30, 5);
  camera.lookAt(new THREE.Vector3());

  moonLight = new THREE.PointLight(0xffffff, 2, 150);
  scene.add(moonLight);

  stars = new THREE.Group();
  scene.add(stars);
  starsLights = new THREE.Group();
  scene.add(starsLights);

  createMoon();
  createTerrain();
  createStars();

  requestAnimationFrame(render);
});

function createMoon() {
  const geometry = new THREE.SphereGeometry(8, 32, 32);
  const material = new THREE.MeshPhongMaterial({
    color: 0x26fdd9,
    shininess: 15,
    emissive: 0x2bb2e6,
    emissiveIntensity: 0.8,
  });
  moon = new THREE.Mesh(geometry, material);
  moon.position.set(-9, 2, -6.5);
  moon.rotation.y = -1;
  scene.add(moon);
  moonLight.position.copy(moon.position);
  moonLight.position.y += 4;

  const moonLight2 = new THREE.PointLight(0xffffff, 0.6, 150);
  scene.add(moonLight2);
  moonLight2.position.set(20, -20, -25);
}

function createTerrain() {
  const geometry = new THREE.PlaneGeometry(150, 150, 120, 120);
  const m = new THREE.Matrix4();
  m.makeRotationX(Math.PI * -0.5);
  geometry.applyMatrix(m);

  geometry.vertices.forEach((vector) => {
    const ratio = noise.simplex3(vector.x * 0.03, vector.z * 0.03, 0);
    // const ratio = noise.simplex3(vector.x * 0.01, vector.z * 0.01, 0); // Lower frequency / terrrain
    vector.y = ratio * 10;
  });

  const material = new THREE.MeshPhongMaterial({
    color: 0x198257,
    emissive: 0x032f50,
    shininess: 10,
  });

  const plane = new THREE.Mesh(geometry, material);
  scene.add(plane);
}

function createStars() {
  const geometry = new THREE.SphereGeometry(0.2, 16);
  const material = new THREE.MeshBasicMaterial({ color: 0x7e22ce });

  for (let i = 0; i < starsAmount; i++) {
    const star = new THREE.Mesh(geometry, material);
    star.position.set(
      (Math.random() - 0.5) * 150,
      (Math.random() - 0.5) * 150,
      0
    );
    const ratio = noise.simplex3(star.position.x * 0.03, star.position.y * 0.03, 0);
    star.position.y = ratio * 10 + 0.3;
    stars.add(star);

    const velX = (Math.random() + 0.1) * 0.1 * (Math.random() < 0.5 ? -1 : 1);
    const velY = (Math.random() + 0.1) * 0.1 * (Math.random() < 0.5 ? -1 : 1);
    star.vel = new THREE.Vector2(velX, velY);
  }
}

function updateStar(star, index) {
  star.position.x += star.vel.x;
  star.position.y = Math.sin(performance.now() * 0.001 + index) * 2 + 0.3;
  star.position.z += star.vel.y;

  if (star.position.x < -75) star.position.x = 75;
  if (star.position.x > 75) star.position.x = -75;
  if (star.position.z < -75) star.position.z = 75;
  if (star.position.z > 75) star.position.z = -75;
}

function render(currentTimestamp) {
  const targetFPS = 20;
  const frameDelay = 1000 / targetFPS;
  const elapsed = currentTimestamp - lastTimestamp;

  if (elapsed >= frameDelay) {
    lastTimestamp = currentTimestamp;

    for (let i = 0; i < starsAmount; i++) {
      updateStar(stars.children[i], i);
    }
    renderer.render(scene, camera);
  }

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
