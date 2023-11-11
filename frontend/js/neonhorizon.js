var container = document.getElementById("slider");
var width = container.clientWidth;
var height = container.clientHeight;
var aspect = width / height;
var renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
container.appendChild(renderer.domElement);

var scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 2000);
camera.position.z = 1000;
camera.position.y = 200;

scene.add(new THREE.AmbientLight(0x3399ff, 0.3));

var light = new THREE.DirectionalLight(0x000000, 1);
light.position.set(0, 2000, -2800);

scene.add(light);

var spotLight = new THREE.SpotLight(0xd30491, 20, 3000, Math.PI);
spotLight.position.set(0, 1500, -1300);
var spotTarget = new THREE.Object3D();
spotTarget.position.set(0, 0, 0);
spotLight.target = spotTarget;

scene.add(spotTarget);
scene.add(spotLight);
scene.add(new THREE.PointLightHelper(spotLight, 1));

var terrain = THREE.SceneUtils.createMultiMaterialObject(
  new THREE.PlaneGeometry(4000, 4000, 40, 40), [
    new THREE.MeshLambertMaterial({
      color: 0x1c3d85
    }),
    new THREE.MeshBasicMaterial({
      color: 0x1c3d85,
      wireframe: true
    })
  ]
);

var heightmap = [];

for (var i = 0; i < terrain.children[0].geometry.vertices.length; i++) {
  heightmap[i] = Math.random() * 100;
  terrain.children[0].geometry.vertices[i].setZ(heightmap[i]);
}

terrain.children[0].geometry.computeFlatVertexNormals();
terrain.rotateX(-Math.PI / 2);

scene.add(terrain);

var background = new THREE.Scene();

var bgcamera = new THREE.PerspectiveCamera(50, aspect, 0.1, 20000);
bgcamera.position.z = 20000;
bgcamera.position.y = 0;

background.add(new THREE.AmbientLight(0x0878af, 2));

var light2 = new THREE.DirectionalLight(0x356399, 10);
light2.position.set(0, -10000, 30000);

background.add(light2);

var planet = THREE.SceneUtils.createMultiMaterialObject(
  new THREE.IcosahedronGeometry(7000, 3), [
    new THREE.MeshLambertMaterial({
      color: 0x0878af
    }),
    new THREE.MeshBasicMaterial({
      color: 0x356399,
      wireframe: true
    })
  ]
);

planet.position.y -= 1500;
background.add(planet);

var spotLight3 = new THREE.SpotLight(0x3399ff, 7, 10000, Math.PI);
spotLight3.position.set(1000, 0, 10000);
spotLight3.target = planet.children[0];

background.add(spotLight3);

// Limited number of particles
for (var i = 0; i < 10; i++) {
    var particles = new THREE.Points(
        new THREE.Geometry(),
        new THREE.PointsMaterial({
          size: Math.random() * 40 + 10 // Adjust the size range
        })
    );

    // Limited number of particles per system
    for (var j = 0; j < 5; j++) {
        var vertex = new THREE.Vector3();
        vertex.x = Math.random() * width - width / 2;
        vertex.y = Math.random() * height - height / 2;
        vertex.z = 0;
        particles.geometry.vertices.push(vertex);
        particles.material.color.setScalar(Math.random() * 0.4 + 0.2);
    }

    background.add(particles);
}

renderer.setClearColor(0x000000, 1);
renderer.autoClear = false;

var composer = new THREE.EffectComposer(renderer);
var backgroundPass = new THREE.RenderPass(background, bgcamera);
backgroundPass.clear = true;
backgroundPass.clearDepth = true;
composer.addPass(backgroundPass);

var renderPass = new THREE.RenderPass(scene, camera);
renderPass.clear = false;
renderPass.clearDepth = true;
renderPass.renderToScreen = true;

composer.addPass(renderPass);

var badTVPass = new THREE.ShaderPass(THREE.BadTVShader);
badTVPass.uniforms["distortion"].value = 0.5;
badTVPass.uniforms["distortion2"].value = 0.5;
badTVPass.uniforms["rollSpeed"].value = 0.05;

var staticPass = new THREE.ShaderPass(THREE.StaticShader);
staticPass.uniforms["amount"].value = 0.02;
staticPass.uniforms["size"].value = 1;

var filmPass = new THREE.ShaderPass(THREE.FilmShader);
filmPass.uniforms["sCount"].value = 800;
filmPass.uniforms["sIntensity"].value = 0.2;
filmPass.uniforms["nIntensity"].value = 0.1;
filmPass.uniforms["grayscale"].value = 0;

var rgbPass = new THREE.ShaderPass(THREE.RGBShiftShader);
rgbPass.uniforms["angle"].value = 0;
rgbPass.uniforms["amount"].value = 0.0005;
composer.addPass(rgbPass);

composer.addPass(staticPass);
composer.addPass(filmPass);
badTVPass.renderToScreen = true;
composer.addPass(badTVPass);

var clock = new THREE.Clock();

var scriptRunning = true;
render();

function render() {
  if (!scriptRunning) {
    return; // Stop rendering if scriptRunning is false
  }
  requestAnimationFrame(render);
  var delta = clock.getDelta();

  badTVPass.uniforms['time'].value = delta;
  filmPass.uniforms['time'].value = delta;
  staticPass.uniforms['time'].value = delta;

  terrain.position.z += 2; // 4 original (faster terrain speed)or any other smaller value
  planet.rotateY(-0.001)

  if (!(terrain.position.z % 100)) {
    for (var i = 0; i < 41; i++)
      heightmap.unshift(heightmap.pop());

    for (var i = 0; i < terrain.children[0].geometry.vertices.length; i++) {
      terrain.children[0].geometry.vertices[i].z = heightmap[i];
      terrain.children[0].geometry.verticesNeedUpdate = true;
    }

    terrain.children[0].geometry.computeFlatVertexNormals();
    terrain.position.z = terrain.position.z % 100;
  }

  composer.render(delta);
}

function handleIntersection(entries, observer) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // Slider is in view
      if (!scriptRunning) {
        // Start rendering
        scriptRunning = true;
        render();
      }
    } else {
      // Slider is out of view
      if (scriptRunning) {
        // Stop rendering
        scriptRunning = false;
      }
    }
  });
}

var options = {
  root: null,
  rootMargin: '0px',
  threshold: 0.6,
};

var observer = new IntersectionObserver(handleIntersection, options);
observer.observe(container);


/* ========================================================
    TOOLS BLOB ANIMATION HANDLED HERE
======================================================== */
// Get the AI shape container
var shapeToolsElement = document.querySelector('.aishapeTools');

// Function to reset the animation rule
function resetAnimation() {
  shapeToolsElement.style.animation = 'none';
  shapeToolsElement.offsetHeight; // Trigger reflow to apply style immediately
  shapeToolsElement.style.animation = 'morphing 16s ease-in-out infinite';
}

// Function to handle intersection changes
function handleIntersectionTools(entries, customObserver) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // Element is in view, restore animation
      resetAnimation();
    } else {
      // Element is out of view, reset animation
      shapeToolsElement.style.animation = 'none';
    }
  });
}

// Options for the Intersection Observer
var optionsTools = {
  root: null,
  rootMargin: '0px',
  threshold: 0.3,
};

// Create the Intersection Observer with a different variable name
var toolsBlobObserver = new IntersectionObserver(handleIntersectionTools, optionsTools);

// Observe the element
toolsBlobObserver.observe(shapeToolsElement);
