import * as THREE from "three";
import { VRButton } from "three/examples/jsm/webxr/VRButton";

const container = document.createElement("div");
document.body.appendChild(container);

const clock = new THREE.Clock();

const camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    200,
);
camera.position.set(0, 1.6, 5);

const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.setClearColor(0xffffff);

container.appendChild(renderer.domElement);

const dolly = new THREE.Object3D();
dolly.add(camera);
scene.add(dolly);

const dummyCam = new THREE.Object3D();
camera.add(dummyCam);

renderer.xr.enabled = true;
document.body.appendChild(VRButton.createButton(renderer));

function onSelectStart() {
    this.userData.selectPressed = true;
}

function onSelectEnd() {
    this.userData.selectPressed = false;
}

const controller = renderer.xr.getController(0);
dolly.add(controller);
controller.addEventListener("selectstart", onSelectStart);
controller.addEventListener("selectend", onSelectEnd);
scene.add(controller);

const controllerGrip = renderer.xr.getControllerGrip(0);
scene.add(controllerGrip);

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

function render() {
    const dt = clock.getDelta();
    if (controller) handleController(controller, dt);
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(render);
