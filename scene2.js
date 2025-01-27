import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

let orb, chair;
const clock = new THREE.Clock();

export const scene2 = async (scene, posZ) => {
    let sceneEmpty = new THREE.Group();
    sceneEmpty.position.set(0, 0, -posZ - 25);
    scene.add(sceneEmpty);

    const light = new THREE.DirectionalLight(0xebfffe, 4);
    /* scene.add(new THREE.DirectionalLightHelper(light, 5)); */
    light.position.set(0, 40, -100);
    light.castShadow = true;
    light.shadow.mapSize.set(64, 2048);
    light.shadow.camera.top = 100;
    light.shadow.camera.bottom = -100;
    light.shadow.camera.far = 161;
    light.shadow.camera.near = 50;
    sceneEmpty.add(light);

    const loader = new GLTFLoader();

    loader.load("assets/Mountains.glb", (gltf) => {
        const mountain = gltf.scene;
        mountain.traverse((child) => {
            if (child.isMesh) {
                child.material.normalMap = null;
            }
        });
        mountain.rotateY(-Math.PI / 2);
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
    });
    orb = new THREE.Mesh(orbGeometry, orbMaterial);
    orb.position.set(0, 7, 0);
    orb.castShadow = true;
    sceneEmpty.add(orb);

    const groundGeometry = new THREE.BoxGeometry(0.3, 50, 0.2);
    const groundMaterial = new THREE.MeshStandardMaterial({});
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

    loader.load("assets/Chair.glb", (gltf) => {
        chair = gltf.scene;
        chair.traverse((child) => {
            if (child.isMesh) {
                child.material.normalMap = null;
                child.material.color = new THREE.Color(0xffffff);
                child.material.emissive = new THREE.Color(0xffffff);
                child.material.emissiveIntensity = 0.5;
            }
        });
        chair.position.set(0, 0, -32);
        chair.rotateY((Math.PI / 4) * 4.5);
        /* chair.rotateZ(Math.PI / 10);
        chair.rotateX(-Math.PI / 10); */
        sceneEmpty.add(chair);
    });
};

export const animateScene2 = () => {
    orb.position.y = Math.sin(clock.getElapsedTime() / 2) + 7;
    /* if (chair) {
        chair.position.y = Math.sin(clock.getElapsedTime() + 450 / 4) / 4 + 0.5;
    } */
};
