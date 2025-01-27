import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { environmentSetup } from './environment';
import Stats from 'three/examples/jsm/libs/stats.module';
import ImmersiveControls from '@depasquale/three-immersive-controls';

let camera, scene, renderer, hallway, stats;
const objects = [];

const loader = new GLTFLoader();
const playerHeight = 1.6;

init();

function init() {
  stats = Stats();
  document.body.appendChild(stats.dom);

  // === Configuration de la caméra ===
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 200);
  camera.position.y = playerHeight;

  // === Création de la scène ===
  scene = new THREE.Scene();
  environmentSetup(scene);

  // === Chargement du modèle GLB ===
  loader.load('assets/Hlw0.1.glb', (gltf) => {
    hallway = gltf.scene;
    hallway.traverse((child) => {
      if (child.isMesh) {
        child.receiveShadow = true;
        child.material.normalMap = null;
        child.material.onBeforeCompile = function (shader) {
          shader.fragmentShader = shader.fragmentShader.replace(
            '#include <roughnessmap_fragment>',
            THREE.ShaderChunk.roughnessmap_fragment.replace('texelRoughness =', 'texelRoughness = 1. -')
          );
        };
      }
    });
    hallway.receiveShadow = true;
    hallway.rotateY(-Math.PI / 2);
    hallway.position.set(0, 0, -13);
    scene.add(hallway);
  }, undefined, (error) => {
    console.error('Erreur lors du chargement du hallway :', error);
  });

  // === Ajouter des lumières ===
  const light = new THREE.PointLight(0xffeacc, 1, 0, 2);
  const lightBoxGeometry = new THREE.BoxGeometry(0.5, 0.1, 0.5);
  const lightBoxMaterial = new THREE.MeshStandardMaterial({ color: 0xffeacc, emissive: 0xffeacc, emissiveIntensity: 0.5 });
  const lightBox = new THREE.Mesh(lightBoxGeometry, lightBoxMaterial);
  lightBox.castShadow = true;

  for (let i = 0; i < 6; i++) {
    const lightInstance = light.clone();
    const lightBoxInstance = lightBox.clone();
    lightInstance.position.set(0, 2.4, -i * 5);
    lightInstance.castShadow = true;
    scene.add(lightInstance);
    lightInstance.add(lightBoxInstance);
    lightBoxInstance.position.set(0, 0.1, 0);
  }

  // === Création du plan de fond ===
  const farPlaneGeometry = new THREE.PlaneGeometry(2000, 2000, 1, 1);
  const farPlaneMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
  const farPlane = new THREE.Mesh(farPlaneGeometry, farPlaneMaterial);
  farPlane.position.set(0, 0, -100);
  scene.add(farPlane);

  // === Initialisation du renderer ===
  renderer = new THREE.WebGLRenderer({
    powerPreference: "high-performance",
    antialias: true
  });

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.BasicShadowMap;
  document.body.appendChild(renderer.domElement);

  // === Tone Mapping ===
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  // === Contrôles de caméra ===
  const controls = new ImmersiveControls(camera, renderer, scene, {
    initialPosition: new THREE.Vector3(0, playerHeight, 0),
    showEnterVRButton: false,
    showExitVRButton: true,
    keyboardControls: true, // Active les contrôles clavier
    vrControls: true,
    collisionsEnabled: true,
    mouseControls: false, // Désactive les contrôles souris par défaut dans ImmersiveControls
  });

  // === Activer le mode VR ===
  renderer.xr.enabled = true;
  document.body.appendChild(VRButton.createButton(renderer));

  renderer.setAnimationLoop(animate);
  window.addEventListener('resize', onWindowResize);

  // Écoute des événements de la souris
  window.addEventListener('mousemove', onMouseMove);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

let mouseX = 0;
let mouseY = 0;
let mouseSensitivity = 0.002; // Sensibilité de la souris

// Fonction pour gérer le mouvement de la souris (rotation de la caméra)
function onMouseMove(event) {
  mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
}

function animate() {
  stats.begin();

  // Rotation de la caméra selon la souris
  camera.rotation.y += mouseX * mouseSensitivity;
  camera.rotation.x += mouseY * mouseSensitivity;
  camera.rotation.x = Math.max(Math.min(camera.rotation.x, Math.PI / 2), -Math.PI / 2); // Limite de la rotation sur l'axe X

  controls.update();
  renderer.render(scene, camera);
  stats.end();
}
