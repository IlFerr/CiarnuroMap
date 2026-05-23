import * as THREE from "three";

export function createScene() {
  return new THREE.Scene();
}

export function createCamera({
  fov = 75,
  aspect = window.innerWidth / window.innerHeight,
  near = 0.1,
  far = 1200,
} = {}) {
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  return camera;
}

export function createRenderer({ antialias = true } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  if (THREE.LinearSRGBColorSpace)
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  renderer.physicallyCorrectLights = true;
  renderer.toneMappingExposure = 1.0;
  return renderer;
}

export function createTextureLoader() {
  return new THREE.TextureLoader();
}
