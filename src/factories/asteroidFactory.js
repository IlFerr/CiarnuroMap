import * as THREE from "three";

export function createAsteroids({ scene, distance = 10, num = 800 } = {}) {
  const group = new THREE.Group();
  const positions = new Float32Array(num * 3);
  const radius = (distance || 10) / 10;
  for (let i = 0; i < num; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = radius + (Math.random() - 0.5) * 0.2;
    const x = Math.cos(angle) * r;
    const y = (Math.random() - 0.5) * 0.05;
    const z = Math.sin(angle) * r;
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
  }
  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({ size: 0.003 });
  const points = new THREE.Points(geom, mat);

  points.userData.parentGroup = group; // in modo che i click risalgano al gruppo
  group.add(points);

  group.userData.info = {
    type: "asteroid_belt",
    distance: distance,
  };
  scene.add(group);
  return group;
}
