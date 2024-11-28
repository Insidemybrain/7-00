import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';

let camera, scene, renderer, controls, logo;

const objects = [];

let raycaster;

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;

let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const vertex = new THREE.Vector3();
const color = new THREE.Color();
const loader = new GLTFLoader();

init();

function init() {
    // === Configuration de la caméra ===
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.y = 10;

    // === Création de la scène ===
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xffffff );
    scene.fog = new THREE.Fog(0x000000, 0, 750);

     // === Éclairage ===
    const ambientLight = new THREE.AmbientLight(0x404040, 2); // Lumière ambiante
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2); // Lumière directionnelle
    directionalLight.position.set(0, 0, -5); // Position de la lumière
    scene.add(directionalLight);
    const light = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 2.5 );
				light.position.set( 0.5, 1, 0.75 );
				scene.add( light );
        
// Le sol
let floorGeometry = new THREE.PlaneGeometry(2000, 2000, 100, 100);
floorGeometry.rotateX(-Math.PI / 2);

// vertex displacement
let position = floorGeometry.attributes.position;
const vertex = new THREE.Vector3();

for (let i = 0, l = position.count; i < l; i++) {
  vertex.fromBufferAttribute(position, i);

  // Déplacement aléatoire sur X et Z, mais pas sur Y
  vertex.x += Math.random() * 20 - 10;
  vertex.z += Math.random() * 20 - 10;

  // La coordonnée Y reste constante, pour ne pas déformer l'horizon
  vertex.y = 0; 

  position.setXYZ(i, vertex.x, vertex.y, vertex.z);
}

floorGeometry = floorGeometry.toNonIndexed(); // ensure each face has unique vertices

// Remplacer la couleur du sol par un noir uni
const floorMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 }); // Sol noir

const floor = new THREE.Mesh(floorGeometry, floorMaterial);
scene.add(floor);


    // === PointerLockControls ===
    controls = new PointerLockControls( camera, document.body );
    const blocker = document.getElementById( 'blocker' );
				const instructions = document.getElementById( 'instructions' );

				blocker.addEventListener( 'click', function () {

					controls.lock();

				} );

				controls.addEventListener( 'lock', function () {

					instructions.style.display = 'none';
					blocker.style.display = 'none';

				} );

				controls.addEventListener( 'unlock', function () {

					blocker.style.display = 'block';
					instructions.style.display = '';

				} );

				scene.add( controls.object );

    // Événements du clavier
    const onKeyDown = function ( event ) {

      switch ( event.code ) {

        case 'ArrowUp':
        case 'KeyW':
          moveForward = true;
          break;

        case 'ArrowLeft':
        case 'KeyA':
          moveLeft = true;
          break;

        case 'ArrowDown':
        case 'KeyS':
          moveBackward = true;
          break;

        case 'ArrowRight':
        case 'KeyD':
          moveRight = true;
          break;

        case 'Space':
          if ( canJump === true ) velocity.y += 150;
          canJump = false;
          break;

      }

    };

    const onKeyUp = function ( event ) {

      switch ( event.code ) {

        case 'ArrowUp':
        case 'KeyW':
          moveForward = false;
          break;

        case 'ArrowLeft':
        case 'KeyA':
          moveLeft = false;
          break;

        case 'ArrowDown':
        case 'KeyS':
          moveBackward = false;
          break;

        case 'ArrowRight':
        case 'KeyD':
          moveRight = false;
          break;

      }

    };

    document.addEventListener( 'keydown', onKeyDown );
    document.addEventListener( 'keyup', onKeyUp );

    // Création du raycaster pour détecter le sol
    raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );

    // === Chargement du modèle GLB ===
    loader.load('Logo.glb', (gltf) => {
        logo = gltf.scene;
        logo.traverse((child) => {
            if (child.isMesh) {
                const textureLoader = new THREE.TextureLoader();
                const normalMap = textureLoader.load('normal_map.png'); // Normal map

                child.material = new THREE.MeshStandardMaterial({
                    normalMap: normalMap,
                    roughness: 0.5,
                    metalness: 0.5,
                });
            }
        });
        logo.position.set(0, 10, -4); // Position fixe, ne dépend plus de la caméra
        
        scene.add(logo);
    }, undefined, (error) => {
        console.error('Erreur lors du chargement du logo :', error);
    });

   
    // === Initialisation du renderer ===
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // === Activer le mode VR ===
    renderer.xr.enabled = true;
    document.body.appendChild(VRButton.createButton(renderer)); // Ajouter le bouton VR

    renderer.setAnimationLoop(animate);
    window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
 camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

  const time = performance.now();

  if ( controls.isLocked === true ) {

    raycaster.ray.origin.copy( controls.object.position );
    raycaster.ray.origin.y -= 10;

    const intersections = raycaster.intersectObjects( objects, false );

    const onObject = intersections.length > 0;

    const delta = ( time - prevTime ) / 1000;

    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;

    velocity.y -= 7 * 100.0 * delta; // 100.0 = mass

    direction.z = Number( moveForward ) - Number( moveBackward );
    direction.x = Number( moveRight ) - Number( moveLeft );
    direction.normalize(); // this ensures consistent movements in all directions

    if ( moveForward || moveBackward ) velocity.z -= direction.z * 15.0 * delta; // valeur pour ralentir le mouvement
    if ( moveLeft || moveRight ) velocity.x -= direction.x * 15.0 * delta; // cette valeur pour ralentir le mouvement

    if ( onObject === true ) {

      velocity.y = Math.max( 0, velocity.y );
      canJump = true;

    }

    controls.moveRight( - velocity.x * delta );
    controls.moveForward( - velocity.z * delta );

    controls.object.position.y += ( velocity.y * delta ); // new behavior

    if ( controls.object.position.y < 10 ) {

      velocity.y = 0;
      controls.object.position.y = 10;

      canJump = true;

    }
  }

  prevTime = time;

  renderer.render( scene, camera );
}