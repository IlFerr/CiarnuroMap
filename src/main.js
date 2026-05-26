import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Constellation } from "./Constellation.js";
import { loadSystem } from "./loaders/systemLoader.js";
import { muoviPianeti } from "./core/animate.js";
import { attachPointerHandlers } from "./input/pointerHandlers.js";
import { mostraAttributi, rimuoviAttributi } from "./ui/infoPanel.js";

// ── Renderer ──────────────────────────────────────────────────────────────────
const canvas = document.getElementById("canvas");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

// ── UI refs ───────────────────────────────────────────────────────────────────
const loadingEl = document.getElementById("loading");
const fadeEl = document.getElementById("scene-fade");
const constUI = document.getElementById("constellation-ui");
const solarUI = document.getElementById("solar-ui");
const titleEl = document.getElementById("constellation-title");
const clickHintEl = document.getElementById("click-hint");
const starHintEl = document.getElementById("star-hint");
const noSystemEl = document.getElementById("no-system-hint");
const bottomHintEl = document.getElementById("bottom-hint");
const constBackBtn = document.getElementById("const-back-btn");
const solarBackBtn = document.getElementById("solar-back-btn");
const exploreBtn = document.getElementById("explore-btn");

let mode = "constellation";
let transitioning = false;
let pendingSystemFile = null;
let selectedStarIndex = -1;

exploreBtn.addEventListener("click", () => {
  if (pendingSystemFile && !transitioning) {
    enterSolarMode(pendingSystemFile);
  }
});

// ═════════════════════════════════════════════════════════════════════════════
//  CONSTELLATION SCENE
// ═════════════════════════════════════════════════════════════════════════════

const constScene = new THREE.Scene();
const constCamera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  200,
);
constCamera.position.set(0, 0, 8);
const cam = { tx: 0, ty: 0, tz: 8, cx: 0, cy: 0, cz: 8 };

(function () {
  const N = 4000,
    pos = new Float32Array(N * 3),
    col = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 44;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 30;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 4 - 1;
    const br = 0.25 + Math.random() * 0.75,
      tn = Math.random();
    col[i * 3] = br * (0.85 + tn * 0.15);
    col[i * 3 + 1] = br * (0.88 + tn * 0.1);
    col[i * 3 + 2] = br;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  constScene.add(
    new THREE.Points(
      geo,
      new THREE.PointsMaterial({
        vertexColors: true,
        size: 0.016,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.72,
        depthWrite: false,
      }),
    ),
  );
})();

let constellations = [];
const constRaycaster = new THREE.Raycaster();
const constMouse = new THREE.Vector2();
const zPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

function toNDC(clientX, clientY) {
  return new THREE.Vector2(
    (clientX / window.innerWidth) * 2 - 1,
    -(clientY / window.innerHeight) * 2 + 1,
  );
}
function worldAtNDC(ndc) {
  constRaycaster.setFromCamera(ndc, constCamera);
  const hit = new THREE.Vector3();
  return constRaycaster.ray.intersectPlane(zPlane, hit) ? hit : null;
}

let hoveredConst = null;
let isExploring = false;
let exploredConst = null;

let constPointerDown = false;
let constPointerMoved = false;
let constPointerStart = { x: 0, y: 0 };

// ── HUD helpers ───────────────────────────────────────────────────────────────
function showTitle(text, dim = false) {
  titleEl.textContent = text.toUpperCase();
  titleEl.style.opacity = "1";
  titleEl.style.color = dim
    ? "rgba(255,210,140,0.65)"
    : "rgba(255,255,255,0.92)";
  titleEl.style.textShadow = dim
    ? "0 0 20px rgba(255,180,80,0.35)"
    : "0 0 30px rgba(160,200,255,0.7), 0 0 60px rgba(100,150,255,0.35)";
}
function hideTitle() {
  titleEl.style.opacity = "0";
}
function setHint(h) {
  [clickHintEl, starHintEl, noSystemEl].forEach((el) =>
    el.classList.add("hidden"),
  );
  if (h === "click") clickHintEl.classList.remove("hidden");
  if (h === "star") starHintEl.classList.remove("hidden");
  if (h === "noSystem") noSystemEl.classList.remove("hidden");
}

// ── Star panel helpers ────────────────────────────────────────────────────────
function showStarPanel(starData) {
  pendingSystemFile = starData.systemFile;
  exploreBtn.classList.remove("hidden");
}
function hideStarPanel() {
  exploreBtn.classList.add("hidden");
  pendingSystemFile = null;
}

// ── Explore / exit ────────────────────────────────────────────────────────────
function exploreConstellation(c) {
  if (isExploring) return;
  isExploring = true;
  exploredConst = c;
  const center = c.getCenter(),
    radius = c.getRadius();
  cam.tx = center.x;
  cam.ty = center.y;
  cam.tz = Math.max(1.6, radius * 2.0);
  constellations.forEach((o) => {
    if (o !== c) o.setFadingOut(true);
  });
  c.setExplored(true);
  hoveredConst?.setHovered(false);
  hoveredConst = null;
  hideTitle();
  hideStarPanel();
  setHint(null);
  constBackBtn.classList.remove("hidden");
  bottomHintEl.style.opacity = "0";
  setTimeout(() => showTitle(c.name), 400);
  setTimeout(() => setHint("star"), 700);
}

function exitExplore() {
  if (!isExploring) return;
  exploredConst.setExplored(false);
  exploredConst.setHoveredStar(-1);
  constellations.forEach((c) => c.setFadingOut(false));
  cam.tx = 0;
  cam.ty = 0;
  cam.tz = 8;
  isExploring = false;
  exploredConst = null;
  selectedStarIndex = -1;
  constBackBtn.classList.add("hidden");
  hideStarPanel();
  setHint(null);
  hideTitle();
  bottomHintEl.style.opacity = "1";
}
constBackBtn.addEventListener("click", exitExplore);

// ── Constellation pointer events ──────────────────────────────────────────────

canvas.addEventListener("pointermove", (e) => {
  if (mode !== "constellation") return;

  if (constPointerDown) {
    const dx = e.clientX - constPointerStart.x;
    const dy = e.clientY - constPointerStart.y;
    if (Math.sqrt(dx * dx + dy * dy) > 5) constPointerMoved = true;
  }

  const ndc = toNDC(e.clientX, e.clientY);

  constRaycaster.setFromCamera(ndc, constCamera);

  if (isExploring) {
    const hits = constRaycaster.intersectObjects(
      exploredConst.getStarHitMeshes(),
    );
    if (hits.length > 0) {
      const idx = hits[0].object.userData.starIndex;
      const hS = exploredConst.starHasSystem(idx);
      exploredConst.setHoveredStar(idx);
      setHint(null);
      if (hS) {
        showTitle(exploredConst.getStarName(idx));
        canvas.style.cursor = "pointer";
      } else {
        showTitle(exploredConst.getStarName(idx), true);
        setHint("noSystem");
        canvas.style.cursor = "default";
      }
    } else {
      exploredConst.setHoveredStar(-1);
      setHint("star");
      showTitle(exploredConst.name);
      canvas.style.cursor = "default";
    }
    return;
  }

  const areas = constellations.map((c) => c.getHitArea());
  const hits = constRaycaster.intersectObjects(areas);
  const newH = hits.length > 0 ? hits[0].object.userData.constellation : null;
  if (newH !== hoveredConst) {
    hoveredConst?.setHovered(false);
    hoveredConst = newH;
    if (hoveredConst) {
      hoveredConst.setHovered(true);
      showTitle(hoveredConst.name);
      setHint("click");
    } else {
      hideTitle();
      setHint(null);
    }
  }
  if (hoveredConst) {
    const sHits = constRaycaster.intersectObjects(
      hoveredConst.getStarHitMeshes(),
    );
    canvas.style.cursor = sHits.length > 0 ? "pointer" : "pointer";
  } else {
    canvas.style.cursor = "default";
  }
});

canvas.addEventListener("pointerdown", (e) => {
  if (mode !== "constellation" || e.button !== 0) return;
  constPointerDown = true;
  constPointerMoved = false;
  constPointerStart = { x: e.clientX, y: e.clientY };

  if (isExploring) return;

  if (!hoveredConst) return;
});

window.addEventListener("pointerup", (e) => {
  if (mode !== "constellation" || e.button !== 0 || !constPointerDown) return;

  constPointerDown = false;

  const isClick = !constPointerMoved;

  if (!isExploring) {
    canvas.style.cursor = hoveredConst ? "pointer" : "default";
    if (isClick && hoveredConst && !transitioning) {
      exploreConstellation(hoveredConst);
    }
  } else if (isClick) {
    const ndc2 = toNDC(e.clientX, e.clientY);
    constRaycaster.setFromCamera(ndc2, constCamera);
    const sHits = constRaycaster.intersectObjects(
      exploredConst.getStarHitMeshes(),
    );
    if (sHits.length > 0) {
      const idx = sHits[0].object.userData.starIndex;
      if (exploredConst.starHasSystem(idx) && !transitioning) {
        const sd = exploredConst.getStarData(idx);
        enterSolarMode(sd.systemFile);
      }
    } else {
      selectedStarIndex = -1;
      showTitle(exploredConst.name);
      setHint("star");
    }
  }
});

canvas.addEventListener("pointerleave", () => {
  if (mode !== "constellation" || isExploring) return;
  hoveredConst?.setHovered(false);
  hoveredConst = null;
  hideTitle();
  setHint(null);
});

let constPrevTime = performance.now();
function tickConstellation() {
  const now = performance.now();
  const dt = Math.min((now - constPrevTime) / 1000, 0.05);
  constPrevTime = now;

  const cs = 3.5;
  cam.cx += (cam.tx - cam.cx) * Math.min(dt * cs, 1);
  cam.cy += (cam.ty - cam.cy) * Math.min(dt * cs, 1);
  cam.cz += (cam.tz - cam.cz) * Math.min(dt * cs, 1);
  constCamera.position.set(cam.cx, cam.cy, cam.cz);
  constCamera.lookAt(cam.cx, cam.cy, 0);

  constellations.forEach((c) => c.tick(dt));
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.setClearColor(0x000000, 1);
  renderer.render(constScene, constCamera);
}

// ═════════════════════════════════════════════════════════════════════════════
//  SOLAR SCENE  (Ciarnuro, unchanged)
// ═════════════════════════════════════════════════════════════════════════════

const solarScene = new THREE.Scene();
const solarCamera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1200,
);
const SOLAR_BASE = { x: -8, y: 6, z: 28 };
solarCamera.position.set(SOLAR_BASE.x, SOLAR_BASE.y, SOLAR_BASE.z);

const solarControls = new OrbitControls(solarCamera, canvas);
solarControls.enableDamping = true;
solarControls.dampingFactor = 0.05;
solarControls.minDistance = 0.5;
solarControls.maxDistance = 200;
solarControls.enabled = false;

const solarTexLoader = new THREE.TextureLoader();
let solarSystem = [];
let viewingPlanet = false;
let prevControls = null;
let solarPointers = null;

const skyboxCube = new THREE.CubeTextureLoader().load([
  "./assets/textures/skybox/space_py.png",
  "./assets/textures/skybox/space_px.png",
  "./assets/textures/skybox/space_nz.png",
  "./assets/textures/skybox/space_nx.png",
  "./assets/textures/skybox/space_pz.png",
  "./assets/textures/skybox/space_ny.png",
]);

function clearSolarScene() {
  solarSystem.forEach((g) => solarScene.remove(g));
  solarSystem = [];
}

async function loadSolarSystem(url) {
  clearSolarScene();
  solarScene.background = skyboxCube;
  solarCamera.position.set(SOLAR_BASE.x, SOLAR_BASE.y, SOLAR_BASE.z);
  solarControls.target.set(0, 0, 0);
  solarControls.minDistance = 0.5;
  solarControls.maxDistance = 200;
  solarControls.enableZoom =
    solarControls.enablePan =
    solarControls.enableRotate =
      true;
  solarControls.update();
  viewingPlanet = false;
  prevControls = null;
  rimuoviAttributi();

  const groups = await loadSystem({
    url,
    scene: solarScene,
    textureLoader: solarTexLoader,
  });
  groups.forEach((g) => solarSystem.push(g));
}

function onPlanetClick(group) {
  if (viewingPlanet) return;
  prevControls = {
    enableZoom: solarControls.enableZoom,
    enablePan: solarControls.enablePan,
    enableRotate: solarControls.enableRotate,
    minDistance: solarControls.minDistance,
    maxDistance: solarControls.maxDistance,
    target: solarControls.target.clone(),
  };
  viewingPlanet = true;
  solarControls.enableZoom = false;
  solarControls.enablePan = false;
  solarControls.enableRotate = true;

  const worldPos = new THREE.Vector3();
  group.getWorldPosition(worldPos);

  let planetRadius = null;
  try {
    if (group.mesh?.geometry?.parameters?.radius)
      planetRadius = group.mesh.geometry.parameters.radius;
    else if (group.userData?.info?.diameter)
      planetRadius = Math.max(
        0.001,
        parseFloat(group.userData.info.diameter) / 1000,
      );
  } catch (_) {}

  let dist = solarCamera.position.distanceTo(worldPos);
  if (planetRadius && planetRadius > 0) {
    const fovRad = THREE.MathUtils.degToRad(solarCamera.fov);
    const ang = Math.min(Math.PI / 3, Math.max(0.01, 0.5 * 0.33 * fovRad));
    dist = Math.min(1000, Math.max(0.3, (planetRadius / Math.sin(ang)) * 1.15));
  }
  solarControls.minDistance = solarControls.maxDistance = dist;
  const newCamPos = worldPos.clone();
  newCamPos.y = SOLAR_BASE.y;
  newCamPos.z += dist;
  solarCamera.position.copy(newCamPos);
  solarControls.target.copy(worldPos);
  solarControls.update();
  solarBackBtn.classList.add("hidden-planet");
  mostraAttributi(group, { tornaIndietroCallback: tornaIndietroPianeta });
}

function tornaIndietroPianeta() {
  viewingPlanet = false;
  if (prevControls) {
    solarControls.enableZoom = prevControls.enableZoom;
    solarControls.enablePan = prevControls.enablePan;
    solarControls.enableRotate = prevControls.enableRotate;
    solarControls.minDistance = prevControls.minDistance;
    solarControls.maxDistance = prevControls.maxDistance;
    solarControls.target.copy(prevControls.target);
    prevControls = null;
  } else {
    solarControls.enableZoom =
      solarControls.enablePan =
      solarControls.enableRotate =
        true;
    solarControls.minDistance = 0.5;
    solarControls.maxDistance = 200;
  }
  solarCamera.position.set(SOLAR_BASE.x, SOLAR_BASE.y, SOLAR_BASE.z);
  solarControls.target.set(0, 0, 0);
  solarBackBtn.classList.remove("hidden-planet");
  rimuoviAttributi();
  solarControls.update();
}

window.addEventListener("keydown", (e) => {
  if (mode !== "solar") return;
  if (
    viewingPlanet &&
    (e.key === "Escape" || e.key === "ArrowLeft" || e.key === "Backspace")
  )
    tornaIndietroPianeta();
});

const solarClock = new THREE.Clock();
function tickSolar() {
  const delta = Math.min(0.1, solarClock.getDelta());
  muoviPianeti(solarSystem, delta);
  solarControls.update();
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  if (THREE.LinearSRGBColorSpace)
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  renderer.render(solarScene, solarCamera);
}

solarBackBtn.addEventListener("click", () => exitSolarMode());

// ═════════════════════════════════════════════════════════════════════════════
//  MODE TRANSITIONS
// ═════════════════════════════════════════════════════════════════════════════

async function fadeTransition(cb) {
  fadeEl.classList.add("active");
  await new Promise((resolve) => setTimeout(resolve, 450));
  await cb();
  requestAnimationFrame(() =>
    requestAnimationFrame(() => fadeEl.classList.remove("active")),
  );
}

async function enterSolarMode(systemFile) {
  if (transitioning) return;
  transitioning = true;
  hideStarPanel();

  await fadeTransition(async () => {
    mode = "solar";

    if (solarPointers) solarPointers.detach();
    solarControls.enabled = true;
    solarPointers = attachPointerHandlers({
      renderer,
      camera: solarCamera,
      scene: solarScene,
      controls: solarControls,
      onObjectClick: (group) => {
        if (mode === "solar") onPlanetClick(group);
      },
    });

    await loadSolarSystem(systemFile);

    constUI.classList.add("hidden");
    solarUI.classList.remove("hidden");
    canvas.style.cursor = "default";
  });

  transitioning = false;
}

async function exitSolarMode() {
  if (transitioning) return;
  transitioning = true;

  await fadeTransition(async () => {
    mode = "constellation";

    if (solarPointers) {
      solarPointers.detach();
      solarPointers = null;
    }
    solarControls.enabled = false;
    rimuoviAttributi();

    renderer.toneMapping = THREE.NoToneMapping;
    renderer.toneMappingExposure = 1.0;
    if (THREE.SRGBColorSpace) renderer.outputColorSpace = THREE.SRGBColorSpace;

    solarUI.classList.add("hidden");
    constUI.classList.remove("hidden");
    constPrevTime = performance.now();
    canvas.style.cursor = "default";

    exitExplore();
  });

  transitioning = false;
}

// ═════════════════════════════════════════════════════════════════════════════
//  RESIZE
// ═════════════════════════════════════════════════════════════════════════════

window.addEventListener("resize", () => {
  const w = window.innerWidth,
    h = window.innerHeight;
  renderer.setSize(w, h);
  constCamera.aspect = w / h;
  constCamera.updateProjectionMatrix();
  solarCamera.aspect = w / h;
  solarCamera.updateProjectionMatrix();
});

// ═════════════════════════════════════════════════════════════════════════════
//  MAIN LOOP
// ═════════════════════════════════════════════════════════════════════════════

function loop() {
  requestAnimationFrame(loop);
  if (mode === "constellation") tickConstellation();
  else tickSolar();
}

// ═════════════════════════════════════════════════════════════════════════════
//  INIT
// ═════════════════════════════════════════════════════════════════════════════

async function init() {
  try {
    const index = await fetch("data/constellations.json").then((r) => r.json());
    const data = await Promise.all(
      index.map(async (entry) => {
        const sd = await fetch(entry.file).then((r) => r.json());
        return { name: entry.name, colorHex: entry.colorHex, ...sd };
      }),
    );
    data.forEach((d) => {
      const c = new Constellation(d);
      constScene.add(c.getGroup());
      constellations.push(c);
    });
  } catch (err) {
    console.error("Errore caricamento costellazioni:", err);
  }

  loadingEl.style.opacity = "0";
  setTimeout(() => {
    loadingEl.style.display = "none";
  }, 600);
  loop();
}

init();