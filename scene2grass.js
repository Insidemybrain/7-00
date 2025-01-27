import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

let grassMaterial;
const clock = new THREE.Clock();
const grassDensity = 20,
    planeWidth = 3,
    planeDepth = 20;
let scene2Empty;

const createGrass = async () => {
    const groundGeometry = new THREE.PlaneGeometry(planeWidth, planeDepth);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x408f40 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene2Empty.add(ground);

    const gltfLoader = new GLTFLoader();
    const gltf = await gltfLoader.loadAsync("assets/grassLOD1File.glb");

    grassMaterial = new THREE.MeshStandardMaterial({
        color: 0x408f40,
        roughnessMap: new THREE.TextureLoader().load(
            "assets/grassRoughness.png",
        ),
        bumpMap: new THREE.TextureLoader().load("assets/grassBump.png"),
        bumpScale: 4,
    });
    grassMaterial.side = THREE.DoubleSide;
    grassMaterial.onBeforeCompile = (shader) => {
        shader.uniforms.time = { value: 0 };

        shader.vertexShader = `
            attribute float curvature;
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
          `,
        );

        shader.vertexShader = shader.vertexShader.replace(
            "#include <begin_vertex>",
            `
            #include <begin_vertex>
            vec4 worldPos = modelMatrix * instanceMatrix * vec4(position, 1.0);
            worldPos.z += sin((time * 2.0) + worldPos.z + (worldPos.x/5.0)) * 0.15 * position.y;
            transformed = (inverse(modelMatrix * instanceMatrix) * worldPos).xyz;
          `,
        );

        grassMaterial.userData.shader = shader;
    };

    const grassBlade = gltf.scene.children[0];
    const numInstances = grassDensity * planeWidth * planeDepth;
    const instancedMesh = new THREE.InstancedMesh(
        grassBlade.geometry,
        grassMaterial,
        numInstances,
    );

    instancedMesh.castShadow = true;
    instancedMesh.receiveShadow = true;

    const curvatureArray = new Float32Array(numInstances);
    for (let i = 0; i < numInstances; i++) {
        curvatureArray[i] = Math.random() * 0.3;
    }

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
                dummy.rotation.y = Math.random() * Math.PI * 2;
                dummy.scale.setScalar(Math.random() * 0.5 + 0.75);
                dummy.updateMatrix();
                instancedMesh.setMatrixAt(index++, dummy.matrix);
            }
        }
    }

    scene2Empty.add(instancedMesh);
};

export const scene2 = async (scene, posZ) => {
    scene2Empty = new THREE.Group();
    scene2Empty.position.set(0, 0, -posZ);
    scene.add(scene2Empty);

    const dirLight = new THREE.DirectionalLight(0xffdd94, 8);
    dirLight.position.set(0, 2, -planeDepth / 2 - 1);
    dirLight.castShadow = true;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.top = 5.5;
    dirLight.shadow.camera.far = 52;
    scene2Empty.add(dirLight);

    /* const helper = new THREE.DirectionalLightHelper(dirLight);
    scene2Empty.add(helper); */

    createGrass();
    animateScene2();
};

export const animateScene2 = () => {
    if (
        grassMaterial &&
        grassMaterial.userData &&
        grassMaterial.userData.shader
    ) {
        grassMaterial.userData.shader.uniforms.time.value =
            clock.getElapsedTime();
    }
};
