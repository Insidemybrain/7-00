import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

let orb;
const clock = new THREE.Clock();

export const scene2 = async (scene, posZ) => {
    let sceneEmpty = new THREE.Group();
    sceneEmpty.position.set(0, 0, -posZ - 25);
    scene.add(sceneEmpty);

    const GLTLoader = new GLTFLoader();
    const TXTRLoader = new THREE.TextureLoader();

    GLTLoader.load("assets/Mountains.glb", (gltf) => {
        const mountain = gltf.scene;
        mountain.position.set(0, -200, 0);
        sceneEmpty.add(mountain);

        // Create a 3x3 grid of instances
        const distance = 900;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue; // Skip the original mountain
                const mountainClone = mountain.clone();
                mountainClone.position.set(i * distance, -200, j * distance);
                sceneEmpty.add(mountainClone);
            }
        }
    });

    const orbGeometry = new THREE.SphereGeometry(4, 64, 32);
    const orbMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x888888,
        roughness: 0.4,
        reflectivity: 1,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
        sheen: 1,
        sheenRoughness: 0.4,
        sheenColor: 0xffffff,
        emissive: 0xe6fff2,
        emissiveIntensity: 0.1,
    });
    orb = new THREE.Mesh(orbGeometry, orbMaterial);
    orb.position.set(0, 7, 0);
    orb.castShadow = true;
    sceneEmpty.add(orb);

    const light = new THREE.PointLight(0xe6fff2, 100, 0, 3);
    const lightHelper = new THREE.PointLightHelper(light);
    light.position.set(0, 2, -5);
    orb.add(light);

    const groundGeometry = new THREE.BoxGeometry(0.3, 50, 0.2);
    const groundMaterial = new THREE.MeshStandardMaterial({
        emissive: 0xe6fff2,
        emissiveIntensity: 0.05,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotateX(-Math.PI / 2);
    ground.position.set(0, -0.1, 0);
    ground.receiveShadow = true;
    sceneEmpty.add(ground);

    const doorGeometry = new THREE.PlaneGeometry(1.25, 2);
    const doorMaterial = new THREE.MeshStandardMaterial({
        color: 0x000000,
        roughness: 0.2,
        depthWrite: false,
    });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, 1, -25);
    door.receiveShadow = true;
    door.castShadow = true;
    sceneEmpty.add(door);

    let chair;
    GLTLoader.load("assets/Chair.glb", (gltf) => {
        chair = gltf.scene;
        chair.traverse((child) => {
            if (child.isMesh) {
                child.material.normalMap = null;
                child.material.color = new THREE.Color(0xffffff);
            }
        });
        chair.position.set(0, 0, -32);
        chair.rotateY((Math.PI / 4) * 4.5);
        sceneEmpty.add(chair);

        const chairLight = new THREE.PointLight(0xffffff, 5, 0, 3);
        const chairLightHelper = new THREE.PointLightHelper(chairLight);
        chairLight.position.set(0, 1, 0.5);
        chair.add(chairLight);
    });
};

export const animateScene2 = () => {
    orb.position.y = Math.sin(clock.getElapsedTime() / 2) + 7;
};
