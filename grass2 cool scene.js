import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { VRButton } from "three/addons/webxr/VRButton.js";
import { environmentSetup } from "./environment";

let camera, scene, renderer, controls, stats;
let grassMaterial;
const clock = new THREE.Clock();
const grassDensity = 300,
    planeWidth = 6,
    planeDepth = 10;

const createWorld = async () => {
    /* scene.add(new THREE.GridHelper(40, 20)); */

    /* const planeGeometry = new THREE.PlaneGeometry(planeWidth, planeDepth);
    const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.receiveShadow = true;
    scene.add(plane); */

    const radius = 20;
    const sectors = 32;
    const rings = 8;
    const divisions = 64;
    const col = 0x404040;

    const helper1 = new THREE.PolarGridHelper(
        radius,
        sectors,
        rings,
        divisions,
        col,
        col,
    );
    helper1.position.set(0, -0.01, 0);
    scene.add(helper1);

    const doorGeometry = new THREE.PlaneGeometry(1.25, 2);
    const doorMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: 10,
    });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, 1, -5);
    scene.add(door);

    const orbGeometry = new THREE.SphereGeometry(0.5, 64, 32);
    const orbMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        roughness: 0,
        transmission: 1,
        reflectivity: 1,
        thickness: 0.3,
        dispersion: 10,
    });
    const orb = new THREE.Mesh(orbGeometry, orbMaterial);
    orb.position.set(0, 1.5, -2);
    scene.add(orb);

    const gltfLoader = new GLTFLoader();
    const gltf = await gltfLoader.loadAsync("assets/grassLOD0File.glb");

    grassMaterial = new THREE.MeshStandardMaterial({
        color: 0x88ff88,
        roughness: 0,
    });
    grassMaterial.side = THREE.DoubleSide;

    grassMaterial.onBeforeCompile = (shader) => {
        shader.uniforms.time = { value: 0 };

        shader.vertexShader = `
      attribute float curvature;
      attribute float timeoffset;
      uniform float time;
      ${shader.vertexShader}
    `;

        shader.vertexShader = shader.vertexShader.replace(
            "#include <begin_vertex>",
            `
        #include <begin_vertex>
        float angle = curvature * position.y;
        mat2 rotation = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
        transformed.yx = rotation * transformed.yx;

        // Swaying motion
        transformed.x += sin(position.y + time) * 0.1 * position.y;
      `,
        );

        // Save the modified shader so you can update the uniform later
        grassMaterial.userData.shader = shader;
    };

    const grassBlade = gltf.scene.children[0]; // Assuming the grass blade is the first child
    const numInstances = grassDensity * planeWidth * planeDepth;
    const instancedMesh = new THREE.InstancedMesh(
        grassBlade.geometry,
        grassMaterial,
        numInstances,
    );

    // Enable shadows for the instanced mesh
    instancedMesh.castShadow = true;
    instancedMesh.receiveShadow = true;

    // Create an array to store the curvature values
    const curvatureArray = new Float32Array(numInstances);
    const timeoffsetArray = new Float32Array(numInstances);
    for (let i = 0; i < numInstances; i++) {
        curvatureArray[i] = Math.random() * 0.5; // Random curvature factor
        timeoffsetArray[i] = Math.random() * Math.PI;
    }

    // Create a buffer attribute for the curvature values
    instancedMesh.geometry.setAttribute(
        "curvature",
        new THREE.InstancedBufferAttribute(curvatureArray, 1),
    );

    const dummy = new THREE.Object3D();
    let index = 0;
    for (let i = 0; i < planeWidth; i++) {
        for (let j = 0; j < planeDepth; j++) {
            for (let k = 0; k < grassDensity; k++) {
                dummy.position.set(
                    i - planeWidth / 2 + Math.random(),
                    0,
                    j - planeDepth / 2 + Math.random(),
                );
                dummy.rotation.y = Math.random() * Math.PI;
                dummy.scale.setScalar(Math.random() * 0.5 + 0.5);
                dummy.updateMatrix();
                instancedMesh.setMatrixAt(index++, dummy.matrix);
            }
        }
    }

    scene.add(instancedMesh);
};

const init = () => {
    stats = Stats();
    document.body.appendChild(stats.dom);

    camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        1000,
    );
    camera.position.set(-5, 5, 7);
    scene = new THREE.Scene();
    /* scene.background = new THREE.Color(0x222222); */

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: "high-performance",
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.xr.enabled = true;
    document.body.appendChild(VRButton.createButton(renderer));
    renderer.xr.setReferenceSpaceType("local-floor");
    renderer.toneMapping = THREE.ACESFilmicToneMapping;

    /* environmentSetup(scene); */

    const HemisphereLight = new THREE.HemisphereLight(0x000000, 0xffeacc, 0.1);
    HemisphereLight.position.set(-1, 1, -1.5);
    scene.add(HemisphereLight);

    const light = new THREE.PointLight(0xffffff, 100, 0, 2);
    light.position.set(0, 2, -10);
    light.castShadow = true;
    scene.add(light);

    /* // Optional: Add a directional light for better shadows
    const dirLight = new THREE.DirectionalLight(0xffffff, 4);
    dirLight.position.set(0, 2, -10);
    dirLight.target.position.set(0, 0, 0);
    dirLight.castShadow = true;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 50;
    scene.add(dirLight); */

    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
    });

    document.body.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    createWorld();
};

const animate = () => {
    renderer.setAnimationLoop(() => {
        controls.update();
        renderer.render(scene, camera);
        stats.update();

        if (
            grassMaterial &&
            grassMaterial.userData &&
            grassMaterial.userData.shader
        ) {
            grassMaterial.userData.shader.uniforms.time.value =
                clock.getElapsedTime();
        }
    });
};

init();
animate();
