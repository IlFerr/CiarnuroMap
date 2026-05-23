import * as THREE from "three";

export function createConstellationScene(scene, starsData) {
  const starGroup = new THREE.Group();

  starsData.forEach((data) => {
    const geo = new THREE.SphereGeometry(0.1, 16, 16);
    // Materiale con trasparenza per l'effetto comparsa
    const mat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.1, // Quasi invisibile all'inizio
    });

    const star = new THREE.Mesh(geo, mat);
    star.position.set(data.x, data.y, data.z);

    // Salviamo lo stato "target" per l'animazione
    star.userData = { targetOpacity: 0.1, isStar: true };
    starGroup.add(star);
  });

  scene.add(starGroup);
  return starGroup;
}

// Da chiamare nel loop di animazione (index.js)
export function updateStarHover(raycaster, starGroup) {
  // Reset opacità graduale (fade out)
  starGroup.children.forEach((star) => {
    star.material.opacity = THREE.MathUtils.lerp(
      star.material.opacity,
      0.1,
      0.05,
    );
  });

  const intersects = raycaster.intersectObjects(starGroup.children);
  if (intersects.length > 0) {
    // Illumina la stella sotto il mouse
    intersects[0].object.material.opacity = 1.0;
  }
}
