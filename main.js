import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Create the scene
const scene = new THREE.Scene();

// Create a camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 0;

// Create a renderer and attach it to our document
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.xr.enabled = true; // Enable WebXR
document.body.appendChild(renderer.domElement);

// Add VR button to the document
document.body.appendChild(VRButton.createButton(renderer));

// Add orbit controls to allow for camera movement
const controls = new OrbitControls(camera, renderer.domElement);

const material = new THREE.MeshStandardMaterial;

const loader = new GLTFLoader();
let logo;
loader.load('Logo.glb', function (gltf) {
  logo = gltf.scene;
  logo.traverse((child) => {
    if (child.isMesh) {
      child.material = material;
    }
  });
  logo.position.z = -5;
  scene.add(logo);
}, undefined, function (error) {
  console.error(error);
});

// Plane
/* const planeGeometry = new THREE.PlaneGeometry(10, 10);
const plane = new THREE.Mesh(planeGeometry, material);
scene.add(plane); */

const gridHelper = new THREE.GridHelper( 100, 100 );
scene.add( gridHelper );

// Add a light to the scene
const light = new THREE.RectAreaLight(0xffffff, 10, 2, 2);
light.position.set(2, 2, -3);
scene.add(light);
light.lookAt(0, 0, -5);
const lightHelper = new RectAreaLightHelper(light);
light.add(lightHelper);

renderer.setAnimationLoop( function () {
  // Update the controls
  controls.update();

  if (logo) {
    logo.rotation.y += 0.01;
  }

  renderer.render(scene, camera);
});

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
});