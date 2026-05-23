import * as THREE from "three";

export function attachPointerHandlers({
  renderer,
  camera,
  scene,
  controls,
  onObjectClick,
}) {
  const raycaster = new THREE.Raycaster();
  raycaster.params.Points = { threshold: 0.02 };
  const mouse = new THREE.Vector2();

  let pointerDownPos = { x: 0, y: 0 };
  let pointerMoved = false;
  let controlsDragging = false;
  const CLICK_MOVE_THRESHOLD = 5;

  const onControlsStart = () => {
    controlsDragging = true;
  };
  const onControlsEnd = () => {
    controlsDragging = false;
  };
  controls.addEventListener("start", onControlsStart);
  controls.addEventListener("end", onControlsEnd);

  function isIgnoredByUserData(obj) {
    // risaliamo la gerarchia per vedere se qualche antenato ha userData.ignoreClick === true
    let o = obj;
    while (o) {
      if (o.userData && o.userData.ignoreClick) return true;
      o = o.parent;
    }
    return false;
  }

  function onPointerDown(e) {
    pointerDownPos.x = e.clientX;
    pointerDownPos.y = e.clientY;
    pointerMoved = false;
  }

  function onPointerMove(e) {
    const dx = e.clientX - pointerDownPos.x;
    const dy = e.clientY - pointerDownPos.y;
    if (Math.sqrt(dx * dx + dy * dy) > CLICK_MOVE_THRESHOLD)
      pointerMoved = true;
  }

  function onPointerUp(e) {
    // se stiamo usando i controlli o se abbiamo trascinato, ignora
    if (controlsDragging || pointerMoved) return;

    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length === 0) return;

    // Primo oggetto colpito
    const hit = intersects[0];
    const meshCliccata = hit.object;

    // Se l'oggetto (o un suo antenato) è marcato per essere ignorato, esci
    if (isIgnoredByUserData(meshCliccata)) return;

    // risaliamo fino al parentGroup se presente (stesso comportamento di prima)
    const group = meshCliccata.userData.parentGroup || meshCliccata;

    if (typeof onObjectClick === "function")
      onObjectClick(group, meshCliccata, hit);
  }

  window.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);

  const detach = () => {
    window.removeEventListener("pointerdown", onPointerDown);
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
    controls.removeEventListener("start", onControlsStart);
    controls.removeEventListener("end", onControlsEnd);
  };

  return { detach };
}
