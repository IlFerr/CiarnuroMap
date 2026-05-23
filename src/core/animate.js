// src/core/animate.js
import * as THREE from "three";

const clock = new THREE.Clock();

// default in radianti al secondo (modificalo come preferisci)
const DEFAULT_ROTATION_SPEED = 0.5; // rad/s

/**
 * Muove un singolo gruppo (rotazioni locali + orbita se presente)
 * - group: THREE.Group
 * - delta: seconds since last frame
 */
export function muoviPianeta(group, delta) {
  if (!group) return;
  // rotazione angolare di base (rad/s) - priorità: userData.rotationSpeed > userData.info.rotationSpeed > default
  const rs =
    (group.userData &&
      (typeof group.userData.rotationSpeed === "number"
        ? group.userData.rotationSpeed
        : undefined)) ??
    (group.userData &&
    group.userData.info &&
    typeof group.userData.info.rotationSpeed === "number"
      ? group.userData.info.rotationSpeed
      : undefined) ??
    DEFAULT_ROTATION_SPEED;

  // multipliers for different layers (defaults a 1)
  const multipliers =
    (group.userData && group.userData.rotationMultipliers) || {};
  const cloudsMult =
    typeof multipliers.clouds === "number" ? multipliers.clouds : 1.0;
  const glowMult =
    typeof multipliers.glow === "number" ? multipliers.glow : 1.0;
  const lightsMult =
    typeof multipliers.lights === "number" ? multipliers.lights : 1.0;

  // rotate main mesh and layers by speed * delta
  const deltaAngle = rs * delta;
  if (group.mesh) group.mesh.rotation.y += deltaAngle;
  if (group.cloudsMesh) group.cloudsMesh.rotation.y += deltaAngle * cloudsMult;
  if (group.glowMesh) group.glowMesh.rotation.y += deltaAngle * glowMult;
  if (group.lightsMesh) group.lightsMesh.rotation.y += deltaAngle * lightsMult;

  // --- optional: orbital motion ---
  // Se group.userData.orbit è presente, aggiorniamo posizione del gruppo intorno a orbit.center
  // orbit: { speed: rad/s, radius: number, center: THREE.Vector3 (optional), angle: number (internal) }
  const orbit = group.userData && group.userData.orbit;
  if (orbit) {
    // inizializza angle se non presente (calcolando dall'attuale posizione)
    if (typeof orbit.angle !== "number") {
      const center = orbit.center || new THREE.Vector3(0, 0, 0);
      const rel = new THREE.Vector3();
      rel.copy(group.position).sub(center);
      orbit.radius = orbit.radius ?? rel.length();
      orbit.angle = Math.atan2(rel.z, rel.x); // angle in XZ plane
    }

    const orbitSpeed = typeof orbit.speed === "number" ? orbit.speed : 0; // rad/s
    orbit.angle += orbitSpeed * delta;

    const c = orbit.center || new THREE.Vector3(0, 0, 0);
    // manteniamo la y corrente relativa (se vuoi orbita inclinata potresti usare orbit.inclination)
    const y = group.position.y; // preserve current height
    const r = orbit.radius ?? 0;
    group.position.x = c.x + Math.cos(orbit.angle) * r;
    group.position.z = c.z + Math.sin(orbit.angle) * r;
    group.position.y = c.y + (orbit.offsetY ?? y); // offsetY opzionale
  }
}

/**
 * Aggiorna tutto l'array di gruppi
 * - systemArray: array di group
 * - delta: seconds
 */
export function muoviPianeti(systemArray, delta) {
  if (!Array.isArray(systemArray)) return;
  for (let i = 0; i < systemArray.length; i++) {
    muoviPianeta(systemArray[i], delta);
  }
}

/**
 * Avvia il loop di animazione (usa clock internamente)
 * - renderer, scene, camera, controls
 * - getSystemArray: funzione che ritorna l'array corrente di gruppi (per accesso dinamico)
 */
export function startAnimationLoop({
  renderer,
  scene,
  camera,
  controls,
  getSystemArray,
}) {
  function loop() {
    requestAnimationFrame(loop);

    const delta = Math.min(0.1, clock.getDelta()); // cap al frame drop
    const system = typeof getSystemArray === "function" ? getSystemArray() : [];

    // aggiorna rotazioni/orbite
    muoviPianeti(system, delta);

    if (controls) controls.update();
    renderer.render(scene, camera);
  }
  loop();
}
