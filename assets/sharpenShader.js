import * as THREE from 'three';

export const SharpenShader = {
    uniforms: {
        'tDiffuse': { value: null },
        'resolution': { value: new THREE.Vector2() },
        'strength': { value: 1.0 }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform vec2 resolution;
        uniform float strength;
        varying vec2 vUv;

        void main() {
            vec2 texel = vec2(1.0 / resolution.x, 1.0 / resolution.y);
            vec4 color = texture2D(tDiffuse, vUv);
            vec4 north = texture2D(tDiffuse, vUv + vec2(0.0, texel.y));
            vec4 south = texture2D(tDiffuse, vUv - vec2(0.0, texel.y));
            vec4 east = texture2D(tDiffuse, vUv + vec2(texel.x, 0.0));
            vec4 west = texture2D(tDiffuse, vUv - vec2(texel.x, 0.0));
            vec4 sharpened = color * 5.0 - north - south - east - west;
            gl_FragColor = mix(color, sharpened, strength);
        }
    `
};