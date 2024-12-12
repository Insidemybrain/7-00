import * as THREE from 'three';
import { Sky } from 'three/addons/objects/Sky.js';

export function environmentSetup(scene) {
    const sky = new Sky();
    sky.scale.setScalar(450000);
    scene.add(sky);

    const sun = new THREE.Vector3();

    const uniforms = sky.material.uniforms;
    uniforms[ 'turbidity' ].value = 20;
    uniforms[ 'rayleigh' ].value = 4;
    uniforms[ 'mieCoefficient' ].value = 0.005;
    uniforms[ 'mieDirectionalG' ].value = 0.9;

    const phi = THREE.MathUtils.degToRad( 90 - 0 ); // Elevation as second number
    const theta = THREE.MathUtils.degToRad( 180 ); // Azimuth

    sun.setFromSphericalCoords( 1, phi, theta );

    uniforms[ 'sunPosition' ].value.copy( sun );

    /* const ambientLight = new THREE.AmbientLight(0xffeacc, 0.05);
    scene.add(ambientLight); */

    scene.fog = new THREE.FogExp2( 0x0d0b04, 0.1 );

    /* const sunLight = new THREE.DirectionalLight(0xffc073, 10);
    sunLight.position.set(0, .2, -1);
    sunLight.target.position.set(0, 0, 0);
    sunLight.castShadow = true;
    scene.add(sunLight); */

    const HemisphereLight = new THREE.HemisphereLight(0x000000, 0xffeacc, 0.05);
    HemisphereLight.position.set(-1, 1, -1.5);
    scene.add(HemisphereLight);
    /* const helper = new THREE.HemisphereLightHelper( HemisphereLight, 1 );
    scene.add( helper ); */
}