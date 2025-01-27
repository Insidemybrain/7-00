const createSound = async () => {
    const listener = new THREE.AudioListener();
    camera.add(listener);

    const audioLoader = new THREE.AudioLoader();
    const soundSphere = new THREE.SphereGeometry(1, 3, 2);

    audioLoader.load("assets/Song1.mp3", (buffer) => {
        for (let x = -totalLength / 2; x <= totalLength / 2; x += 2) {
            const sound = new THREE.PositionalAudio(listener);
            sound.setBuffer(buffer);
            sound.setRefDistance(1);
            sound.setLoop(true);
            sound.setVolume(0.5);
            sound.play();
            sound.hasPlaybackControl = false;
            sound.isPlaying = true;

            const soundSource = new THREE.Mesh(soundSphere);
            soundSource.position.set(0, 1.6, x);
            soundSource.add(sound);
            scene.add(soundSource);
        }
    });
};
