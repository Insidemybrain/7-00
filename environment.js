import * as THREE from "three";
import { Sky } from "three/examples/jsm/objects/Sky.js";

export let sky;

export function environmentSetup(scene) {
    sky = new Sky();
    sky.scale.setScalar(450000);
    scene.add(sky);

    const sun = new THREE.Vector3();

    const uniforms = sky.material.uniforms;
    uniforms["turbidity"].value = 20;
    uniforms["rayleigh"].value = 4;
    uniforms["mieCoefficient"].value = 0.005;
    uniforms["mieDirectionalG"].value = 0.7;

    const phi = THREE.MathUtils.degToRad(90 - 1); // Elevation as second number
    const theta = THREE.MathUtils.degToRad(180); // Azimuth

    sun.setFromSphericalCoords(1, phi, theta);

    uniforms["sunPosition"].value.copy(sun);

    /* scene.fog = new THREE.FogExp2(0xf0f3f5, 0.003); */
    scene.fog = new THREE.FogExp2(0x333130, 0.003);
}
