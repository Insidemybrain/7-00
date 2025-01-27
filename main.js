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

renderer.shadowMap.enabled = false;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.25;

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

const dummyCam = new THREE.Object3D();
camera.add(dummyCam);

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
    scene2(scene, 25); // 25
}

function setupXR() {
    renderer.xr.enabled = true;
    renderer.xr.setFramebufferScaleFactor(2.0);
    document.body.appendChild(VRButton.createButton(renderer));

    const controller = renderer.xr.getController(0);
    dolly.add(controller);
    controller.addEventListener("selectstart", onSelectStart);
    controller.addEventListener("selectend", onSelectEnd);
    scene.add(controller);

    const controllerGrip = renderer.xr.getControllerGrip(0);
    scene.add(controllerGrip);
}

function onSelectStart() {
    this.userData.selectPressed = true;
}

function onSelectEnd() {
    this.userData.selectPressed = false;
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

function handleController(controller, dt) {
    if (controller.userData.selectPressed) {
        const speed = 2;
        const quaternion = dolly.quaternion.clone();
        dolly.quaternion.copy(
            camera.getWorldQuaternion(new THREE.Quaternion()),
        );
        dolly.translateZ(dt * -speed);
        dolly.position.y = 0;
        dolly.quaternion.copy(quaternion);
    }
}

function animate() {
    stats.update();
    if (scene && camera) {
        renderer.render(scene, camera);
    }

    animateScene2();

    const dt = clock.getDelta();

    if (controls.isLocked) {
        velocity.set(0, 0, 0);

        if (moveState.forward) velocity.z -= moveSpeed * dt;
        if (moveState.backward) velocity.z += moveSpeed * dt;
        if (moveState.left) velocity.x -= moveSpeed * dt;
        if (moveState.right) velocity.x += moveSpeed * dt;

        controls.moveRight(velocity.x);
        controls.moveForward(-velocity.z);
    }

    const controller = renderer.xr.getController(0);
    if (controller) handleController(controller, dt);

    if (dolly.position.z < -57 - 25) {
        dolly.position.y = dolly.position.y - 1;
        if (dolly.position.z < -57 - 25) {
            dolly.position.z = -57.5 - 25;
        }
    }
}

animate();
