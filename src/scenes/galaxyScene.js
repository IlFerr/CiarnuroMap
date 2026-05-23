import * as THREE from "three";

export function createGalaxy(scene) {
  const particlesCnt = 10000;
  const posArray = new Float32Array(particlesCnt * 3);
  const colorsArray = new Float32Array(particlesCnt * 3);

  for (let i = 0; i < particlesCnt; i++) {
    // Formula spirale
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * 10;
    const spinAngle = radius * 0.8; // Effetto torsione

    const x =
      Math.cos(angle + spinAngle) * radius + (Math.random() - 0.5) * 0.5;
    const y = (Math.random() - 0.5) * 0.2; // Spessore galassia
    const z =
      Math.sin(angle + spinAngle) * radius + (Math.random() - 0.5) * 0.5;

    posArray[i * 3] = x;
    posArray[i * 3 + 1] = y;
    posArray[i * 3 + 2] = z;

    // Colore: più bianco al centro, più blu/viola all'esterno
    const mixedColor = new THREE.Color();
    mixedColor.lerpColors(
      new THREE.Color("#f0fdff"),
      new THREE.Color("#4b0082"),
      radius / 10,
    );

    colorsArray[i * 3] = mixedColor.r;
    colorsArray[i * 3 + 1] = mixedColor.g;
    colorsArray[i * 3 + 2] = mixedColor.b;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(posArray, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(colorsArray, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.02,
    vertexColors: true,
    transparent: true,
    blending: THREE.AdditiveBlending,
  });

  const galaxy = new THREE.Points(geo, mat);
  scene.add(galaxy);
  return galaxy;
}
