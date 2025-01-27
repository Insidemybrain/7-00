import * as THREE from "three";
import { VRButton } from "three/addons/webxr/VRButton.js";
import Stats from "three/examples/jsm/libs/stats.module";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";

import { environmentSetup, sky } from "./environment";
import { scene1 } from "./scene1";
import { scene2, animateScene2 } from "./scene2";

const playerHeight = 1.6;

let clock = new THREE.Clock();

const moveState = {
    forward: false,
    backward: false,
    left: false,
    right: false,
};
const velocity = new THREE.Vector3();
const moveSpeed = 5;

const stats = Stats();
document.body.appendChild(stats.dom);

const renderer = new THREE.WebGLRenderer({
    antialias: true,
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.setClearColor(0xffff00);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

renderer.toneMapping = THREE.ACESFilmicToneMapping;
/* renderer.toneMappingExposure = 0.5; */

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.01,
    2000,
);

const dolly = new THREE.Object3D();
dolly.position.set(0, playerHeight, 0);
dolly.add(camera);
scene.add(dolly);

const controls = new PointerLockControls(dolly, document.body);
document.addEventListener("click", () => {
    controls.lock();
});
scene.add(controls.getObject());

document.addEventListener("keydown", onKeyDown, false);
document.addEventListener("keyup", onKeyUp, false);

/* const hemiLight = new THREE.HemisphereLight(0x80caff, 0x3b2e4a, 10);
scene.add(hemiLight); */

init();
setupXR();
renderer.setAnimationLoop(animate);
window.addEventListener("resize", onWindowResize);

function init() {
    environmentSetup(scene);
    scene1(scene, 0);
    scene2(scene, 28); // 28
}

function setupXR() {
    renderer.xr.enabled = true;
    renderer.xr.addEventListener("sessionstart", () => {
        dolly.position.y = 0;
    });
    renderer.xr.setFramebufferScaleFactor(2.0);
    document.body.appendChild(VRButton.createButton(renderer));
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
}

function onKeyDown(event) {
    switch (event.code) {
        case "KeyW":
        case "ArrowUp":
            moveState.forward = true;
            break;
        case "KeyS":
        case "ArrowDown":
            moveState.backward = true;
            break;
        case "KeyA":
        case "ArrowLeft":
            moveState.left = true;
            break;
        case "KeyD":
        case "ArrowRight":
            moveState.right = true;
            break;
    }
}

function onKeyUp(event) {
    switch (event.code) {
        case "KeyW":
        case "ArrowUp":
            moveState.forward = false;
            break;
        case "KeyS":
        case "ArrowDown":
            moveState.backward = false;
            break;
        case "KeyA":
        case "ArrowLeft":
            moveState.left = false;
            break;
        case "KeyD":
        case "ArrowRight":
            moveState.right = false;
            break;
    }
}

function animate() {
    stats.update();
    if (scene && camera) {
        renderer.render(scene, camera);
    }

    animateScene2();

    /* if (dolly.position.z > -28) {
        hemiLight.intensity = 0;
    } else {
        hemiLight.intensity = 10;
    } */

    if (controls.isLocked) {
        let delta = clock.getDelta();
        velocity.set(0, 0, 0);

        if (moveState.forward) velocity.z -= moveSpeed * delta;
        if (moveState.backward) velocity.z += moveSpeed * delta;
        if (moveState.left) velocity.x -= moveSpeed * delta;
        if (moveState.right) velocity.x += moveSpeed * delta;

        controls.moveRight(velocity.x);
        controls.moveForward(-velocity.z);
    }

    if (dolly.position.z < -56 - 28) {
        dolly.position.y = dolly.position.y - 1;
        if (dolly.position.z < -56 - 28) {
            dolly.position.z = -56.5 - 28;
        }
    }
}

animate();
