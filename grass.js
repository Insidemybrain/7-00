import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Stats from "three/examples/jsm/libs/stats.module.js";

let camera, scene, renderer, ground, assets, controls, stats;
let grassStuff;
const grassDensity = 1,
    planeWidth = 10,
    planeDepth = 100;

const createGrassPatch = async (position, rotation, scale) => {
    if (!grassStuff) {
        const gltf = await new GLTFLoader().loadAsync(assets.grassModel);
        const modelGeometry = gltf.scene.children[0].geometry.clone();
        const originalMaterial = gltf.scene.children[0].material;
        const standardMaterial = new THREE.MeshStandardMaterial({
            color: 0x33aa33,
            alphaMap: originalMaterial.alphaMap,
            transparent: true,
        });
        grassStuff = {
            mesh: new THREE.InstancedMesh(
                modelGeometry,
                standardMaterial,
                planeWidth * planeDepth * grassDensity,
            ),
            instances: [],
            update: () => {
                grassStuff.instances.forEach((g, i) => {
                    // Make each blade face the camera
                    g.lookAt(camera.position);
                    g.updateMatrix();
                    grassStuff.mesh.setMatrixAt(i, g.matrix);
                });
                grassStuff.mesh.instanceMatrix.needsUpdate = true;
                requestAnimationFrame(grassStuff.update);
            },
        };
        scene.add(grassStuff.mesh);
        grassStuff.update();

        const empty = new THREE.Object3D();
        empty.scale.setScalar(0);
        empty.updateMatrix();
        for (let i = 0; i < grassStuff.mesh.count; i++) {
            grassStuff.mesh.setMatrixAt(i, empty.matrix);
        }
        grassStuff.mesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);
    }
    const grass = new THREE.Object3D();
    grass.position.copy(position);
    grass.rotation.copy(rotation);
    grass.scale.copy(scale);
    grassStuff.instances.push(grass);
};

const createWorld = async () => {
    scene.add(new THREE.GridHelper(20, 10));
    ground = new THREE.Mesh(
        new THREE.PlaneGeometry(planeWidth, planeDepth),
        new THREE.MeshStandardMaterial({}),
    );
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    for (let i = 0; i < planeDepth * grassDensity; i++) {
        for (let j = 0; j < planeWidth * grassDensity; j++) {
            const position = new THREE.Vector3(
                j / grassDensity - planeWidth / 2 + (Math.random() - 0.5) * 2,
                0,
                i - planeDepth / 2 + (Math.random() - 0.5) * 2,
            );
            await createGrassPatch(
                position,
                new THREE.Euler(0, Math.random() * Math.PI * 2, 0),
                new THREE.Vector3().setScalar(Math.random() * 0.25 + 0.25),
            );
        }
    }
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
    scene.background = new THREE.Color(0x222222);

    let light = new THREE.DirectionalLight(0xffffff, 10);
    light.position.set(0, -2, 0);
    light.lookAt(0, 0, 0);
    scene.add(light);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
    document.body.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    createWorld();
};

const animate = () => {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
    stats.update();
};

assets = { grassModel: "assets/grassModel2.glb" };
init();
animate();
