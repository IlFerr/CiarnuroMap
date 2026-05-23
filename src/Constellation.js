import * as THREE from "three";

// ── Shared textures ───────────────────────────────────────────────────────────

let _starTex = null;
function getStarTexture() {
  if (_starTex) return _starTex;
  const sz = 256,
    cx = 128;
  const cv = Object.assign(document.createElement("canvas"), {
    width: sz,
    height: sz,
  });
  const ctx = cv.getContext("2d");
  const gr = ctx.createRadialGradient(cx, cx, 0, cx, cx, cx);
  gr.addColorStop(0.0, "rgba(255,255,255,1.0)");
  gr.addColorStop(0.04, "rgba(230,240,255,0.98)");
  gr.addColorStop(0.12, "rgba(200,220,255,0.70)");
  gr.addColorStop(0.35, "rgba(160,190,255,0.15)");
  gr.addColorStop(1.0, "rgba(0,0,0,0)");
  ctx.fillStyle = gr;
  ctx.fillRect(0, 0, sz, sz);
  _starTex = new THREE.CanvasTexture(cv);
  return _starTex;
}

function hexToRGB(hex) {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function makeAreaGlowTexture(hex) {
  const sz = 512,
    cx = 256;
  const cv = Object.assign(document.createElement("canvas"), {
    width: sz,
    height: sz,
  });
  const ctx = cv.getContext("2d");
  const [r, g, b] = hexToRGB(hex);
  [
    { ox: 0, oy: 0, rr: cx, a: 0.52 },
    { ox: 40, oy: -30, rr: cx * 0.65, a: 0.28 },
    { ox: -35, oy: 40, rr: cx * 0.55, a: 0.22 },
    { ox: 15, oy: 20, rr: cx * 0.4, a: 0.35 },
  ].forEach(({ ox, oy, rr, a }) => {
    const gr = ctx.createRadialGradient(
      cx + ox,
      cx + oy,
      0,
      cx + ox,
      cx + oy,
      rr,
    );
    gr.addColorStop(0.0, `rgba(${r},${g},${b},${a})`);
    gr.addColorStop(0.4, `rgba(${r},${g},${b},${a * 0.4})`);
    gr.addColorStop(1.0, "rgba(0,0,0,0)");
    ctx.fillStyle = gr;
    ctx.fillRect(0, 0, sz, sz);
  });
  return new THREE.CanvasTexture(cv);
}

function makeGalaxyTexture(hex) {
  const sz = 1024,
    cx = 512;
  const cv = Object.assign(document.createElement("canvas"), {
    width: sz,
    height: sz,
  });
  const ctx = cv.getContext("2d");
  const [r, g, b] = hexToRGB(hex);

  ctx.fillStyle = `rgba(${Math.floor(r * 0.03)},${Math.floor(g * 0.03)},${Math.floor(b * 0.05)},1)`;
  ctx.fillRect(0, 0, sz, sz);

  const tiltAngle = Math.random() * Math.PI;
  const aspect = 0.22 + Math.random() * 0.28;

  function drawBlob(px, py, rxR, ryR, angle, colorStr, alpha, stops) {
    ctx.save();
    ctx.translate(cx + px, cx + py);
    ctx.rotate(angle);
    ctx.scale(rxR, ryR);
    const gr = ctx.createRadialGradient(0, 0, 0, 0, 0, cx);
    (
      stops || [
        [0.0, alpha],
        [0.22, alpha * 0.6],
        [0.5, alpha * 0.22],
        [0.75, alpha * 0.06],
        [1.0, 0],
      ]
    ).forEach(([s, a]) => gr.addColorStop(s, `rgba(${colorStr},${a})`));
    ctx.fillStyle = gr;
    ctx.beginPath();
    ctx.arc(0, 0, cx, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  const rc = `${r},${g},${b}`;
  const warm = `${Math.min(255, r + 50)},${Math.min(255, g + 15)},${Math.max(0, b - 40)}`;
  const cool = `${Math.max(0, r - 20)},${Math.min(255, g + 10)},${Math.min(255, b + 60)}`;

  drawBlob(0, 0, 0.92, aspect, tiltAngle, rc, 0.58);
  drawBlob(28, -18, 0.6, aspect * 0.8, tiltAngle + 0.5, rc, 0.38);
  drawBlob(0, 0, 1.1, 0.7, tiltAngle + 0.2, rc, 0.18, [
    [0.0, 0.18],
    [0.5, 0.06],
    [1.0, 0],
  ]);
  drawBlob(-55, 35, 0.32, 0.18, tiltAngle - 0.8, warm, 0.28);
  drawBlob(45, 60, 0.25, 0.14, tiltAngle + 1.2, warm, 0.2);
  drawBlob(70, -50, 0.28, 0.12, tiltAngle + 0.3, cool, 0.16);
  drawBlob(-60, -30, 0.22, 0.1, tiltAngle - 0.4, cool, 0.14);

  const core = ctx.createRadialGradient(cx, cx, 0, cx, cx, cx * 0.16);
  core.addColorStop(0.0, "rgba(255,255,255,0.95)");
  core.addColorStop(
    0.15,
    `rgba(${Math.min(255, r + 90)},${Math.min(255, g + 90)},255,0.65)`,
  );
  core.addColorStop(0.5, `rgba(${r},${g},${b},0.30)`);
  core.addColorStop(1.0, "rgba(0,0,0,0)");
  ctx.fillStyle = core;
  ctx.fillRect(0, 0, sz, sz);
  return new THREE.CanvasTexture(cv);
}

function makeRingTexture(hex) {
  const sz = 256,
    cx = 128;
  const cv = Object.assign(document.createElement("canvas"), {
    width: sz,
    height: sz,
  });
  const ctx = cv.getContext("2d");
  const [r, g, b] = hexToRGB(hex);
  const gr = ctx.createRadialGradient(cx, cx, cx * 0.48, cx, cx, cx * 0.82);
  gr.addColorStop(0.0, `rgba(${r},${g},${b},0)`);
  gr.addColorStop(0.35, `rgba(${r},${g},${b},0.90)`);
  gr.addColorStop(0.62, "rgba(255,255,255,0.65)");
  gr.addColorStop(0.82, `rgba(${r},${g},${b},0.25)`);
  gr.addColorStop(1.0, "rgba(0,0,0,0)");
  ctx.fillStyle = gr;
  ctx.fillRect(0, 0, sz, sz);
  return new THREE.CanvasTexture(cv);
}

// ── Constellation class ───────────────────────────────────────────────────────

export class Constellation {
  constructor(data) {
    this.data = data;
    this.name = data.name;
    this.colorHex = data.colorHex;
    this.lineIndices = data.lines;
    this.starsData = data.stars;

    this.hoverT = 0;
    this.targetHoverT = 0;
    this.exploreT = 0;
    this.targetExploreT = 0;
    this.fadeOutT = 0;
    this.targetFadeOut = 0;
    this.glowPhase = Math.random() * Math.PI * 2;
    this.hoveredStarIdx = -1;
    this.starHoverT = new Array(data.stars.length).fill(0);

    this.starPositions = data.stars.map((s) => new THREE.Vector3(s.x, s.y, 0));

    this.group = new THREE.Group();
    this.starMeshes = [];
    this.starSprites = [];
    this.systemRings = [];
    this.starHitMeshes = [];
    this.lineMesh = null;
    this.hitArea = null;
    this.areaGlowSprite = null;
    this.galaxySprite = null;
    this.galaxyField = null;

    this._build();
  }

  _center() {
    const s = new THREE.Vector3();
    this.starPositions.forEach((p) => s.add(p));
    return s.divideScalar(this.starPositions.length);
  }
  _radius() {
    const c = this._center();
    return Math.max(...this.starPositions.map((p) => p.distanceTo(c)));
  }
  getCenter() {
    return this._center();
  }
  getRadius() {
    return this._radius();
  }

  _build() {
    this._buildAreaGlow();
    this._buildGalaxy();
    this._buildGalaxyParticles();
    this._buildStars();
    this._buildLines();
    this._buildHitArea();
  }

  _buildAreaGlow() {
    this.areaGlowSprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: makeAreaGlowTexture(this.colorHex),
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        opacity: 0.8,
      }),
    );
    this.areaGlowSprite.position.copy(this._center());
    const s = Math.max(this._radius() * 2.8 + 1.2, 2.5);
    this.areaGlowSprite.scale.set(s, s, 1);
    this.group.add(this.areaGlowSprite);
  }

  _buildGalaxy() {
    this.galaxySprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: makeGalaxyTexture(this.colorHex),
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        opacity: 0,
      }),
    );
    this.galaxySprite.position.copy(this._center());
    const s = Math.max(this._radius() * 4.2 + 2.5, 6.5);
    this.galaxySprite.scale.set(s, s, 1);
    this.group.add(this.galaxySprite);
  }

  _buildGalaxyParticles() {
    const COUNT = 10000;
    const center = this._center();
    const rad = Math.max(this._radius() * 1.7, 1.3);
    const [r, g, b] = hexToRGB(this.colorHex);
    const pos = new Float32Array(COUNT * 3);
    const col = new Float32Array(COUNT * 3);
    const tilt = Math.random() * Math.PI;
    const asp = 0.22 + Math.random() * 0.3;
    const cosT = Math.cos(tilt),
      sinT = Math.sin(tilt);

    for (let i = 0; i < COUNT; i++) {
      const mag =
        Math.sqrt(-2 * Math.log(Math.max(1e-6, Math.random()))) * rad * 0.4;
      const th = 2 * Math.PI * Math.random();
      const px = Math.cos(th) * mag;
      const py = Math.sin(th) * mag * asp;
      const rx = px * cosT - py * sinT;
      const ry = px * sinT + py * cosT;
      pos[i * 3] = center.x + rx;
      pos[i * 3 + 1] = center.y + ry;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.18;
      const dist = Math.sqrt(rx * rx + ry * ry) / rad;
      const fCore = Math.max(0, 1 - dist * 1.9);
      const mix = 0.1 + Math.random() * 0.6;
      const br = (0.2 + Math.random() * 0.8) * (0.35 + fCore * 0.65);
      col[i * 3] = br * (1 - mix + (mix * r) / 255);
      col[i * 3 + 1] = br * (1 - mix + (mix * g) / 255);
      col[i * 3 + 2] = br * ((1 - mix) * 0.75 + (mix * b) / 255 + fCore * 0.25);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    this.galaxyField = new THREE.Points(
      geo,
      new THREE.PointsMaterial({
        vertexColors: true,
        size: 0.007,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    this.group.add(this.galaxyField);
  }

  _buildStars() {
    const starTex = getStarTexture();
    const ringTex = makeRingTexture(this.colorHex);

    this.starsData.forEach((sd, i) => {
      const pos = this.starPositions[i];
      const hasSystem = !!sd.hasSystem;

      // Pallino luminoso: Sprite con texture radiale tintata del colore della stella
      const mesh = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: starTex,
          color: hasSystem ? 0xcce8ff : 0xffddaa,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          opacity: 0,
        }),
      );
      mesh.position.copy(pos);
      mesh.scale.set(0.18, 0.18, 1);
      this.starMeshes.push(mesh);
      this.group.add(mesh);

      const inner = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: starTex,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          opacity: 0,
        }),
      );
      inner.position.copy(pos);
      inner.scale.set(0.45, 0.45, 1);

      const outer = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: starTex,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          opacity: 0,
        }),
      );
      outer.position.copy(pos);
      outer.scale.set(0.9, 0.9, 1);

      this.starSprites.push(inner, outer);
      this.group.add(inner);
      this.group.add(outer);

      const ring = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: ringTex,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          opacity: 0,
        }),
      );
      ring.position.copy(pos);
      ring.scale.set(0.55, 0.55, 1);
      ring.userData.phase = Math.random() * Math.PI * 2;
      this.systemRings.push(ring);
      this.group.add(ring);

      const hMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.24, 6, 4),
        new THREE.MeshBasicMaterial({
          transparent: true,
          opacity: 0,
          depthWrite: false,
        }),
      );
      hMesh.position.copy(pos);
      hMesh.userData.starIndex = i;
      hMesh.userData.constellation = this;
      hMesh.userData.hasSystem = hasSystem;
      this.starHitMeshes.push(hMesh);
      this.group.add(hMesh);
    });
  }

  _buildLines() {
    this.lineMesh = new THREE.LineSegments(
      this._buildLineGeo(),
      new THREE.LineBasicMaterial({
        color: 0x7788aa,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    this.group.add(this.lineMesh);
  }

  _buildLineGeo() {
    const pts = [];
    this.lineIndices.forEach(([a, b]) => {
      pts.push(this.starPositions[a].clone());
      pts.push(this.starPositions[b].clone());
    });
    return new THREE.BufferGeometry().setFromPoints(pts);
  }

  _buildHitArea() {
    const size = Math.max(this._radius() * 2.2 + 1.0, 2.5);
    this.hitArea = new THREE.Mesh(
      new THREE.PlaneGeometry(size, size),
      new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    );
    this.hitArea.position.copy(this._center());
    this.hitArea.userData.constellation = this;
    this.group.add(this.hitArea);
  }

  // ── Public API ────────────────────────────────────────────────────────────
  setHovered(v) {
    this.targetHoverT = v ? 1 : 0;
  }
  setExplored(v) {
    this.targetExploreT = v ? 1 : 0;
  }
  setFadingOut(v) {
    this.targetFadeOut = v ? 1 : 0;
  }
  setHoveredStar(idx) {
    this.hoveredStarIdx = idx;
  }

  starHasSystem(idx) {
    return !!this.starsData[idx]?.hasSystem;
  }
  getStarName(idx) {
    return this.starsData[idx]?.name ?? `Stella ${idx + 1}`;
  }
  getStarData(idx) {
    return this.starsData[idx] ?? null;
  }

  updateStarPosition(idx, newPos) {
    const p = this.starPositions[idx];
    p.set(newPos.x, newPos.y, 0);
    this.starMeshes[idx].position.copy(p);
    this.starHitMeshes[idx].position.copy(p);
    this.starSprites[idx * 2].position.copy(p);
    this.starSprites[idx * 2 + 1].position.copy(p);
    this.systemRings[idx].position.copy(p);
    this.lineMesh.geometry.dispose();
    this.lineMesh.geometry = this._buildLineGeo();
  }

  tick(dt) {
    const sp = 5;
    const now = Date.now();

    this.hoverT += (this.targetHoverT - this.hoverT) * Math.min(dt * sp, 1);
    this.exploreT +=
      (this.targetExploreT - this.exploreT) * Math.min(dt * sp * 0.7, 1);
    this.fadeOutT +=
      (this.targetFadeOut - this.fadeOutT) * Math.min(dt * sp, 1);

    this.starHoverT = this.starHoverT.map((t, i) => {
      const tgt = i === this.hoveredStarIdx ? 1 : 0;
      return t + (tgt - t) * Math.min(dt * sp * 2.0, 1);
    });

    const h = this.hoverT;
    const eT = this.exploreT;
    const mA = 1 - this.fadeOutT;

    // Area glow — visible outside explore
    const pulse = 0.5 + 0.25 * Math.sin(now * 0.0008 + this.glowPhase);
    this.areaGlowSprite.material.opacity = (1 - h) * (1 - eT) * pulse * mA;

    // Galaxy nebula — appears on explore
    this.galaxySprite.material.opacity = eT * 0.78 * mA;
    const gBase = Math.max(this._radius() * 4.2 + 2.5, 6.5);
    this.galaxySprite.scale.setScalar(gBase * (0.5 + eT * 0.7));

    // Galaxy particle field
    this.galaxyField.material.opacity = eT * 0.88 * mA;

    // Stars shrink world-size in explore (camera zooms in, stars stay visually small)
    const shrink = 1 - eT * 0.85;
    // Luminosità ambientale minima: le stelle rimangono sempre leggermente visibili
    const AMBIENT = 0.18;
    const starBaseT = Math.max(AMBIENT, Math.max(h, eT));

    this.starMeshes.forEach((m, i) => {
      const sh = this.starHoverT[i];
      const hS = this.starsData[i].hasSystem;
      m.material.opacity = Math.min(1, (starBaseT + eT * (hS ? 0.6 : 0.35))) * mA;
      const baseSz = 0.18 * shrink;
      m.scale.setScalar(baseSz * (1 + sh * (hS ? 2.2 : 1.4)) * (1 + eT * 0.3));
    });

    this.starSprites.forEach((s, idx) => {
      const si = Math.floor(idx / 2);
      const inner = idx % 2 === 0;
      const sh = this.starHoverT[si];
      const hS = this.starsData[si]?.hasSystem;
      const base = inner ? starBaseT * 0.9 : starBaseT * 0.28;
      const boost = sh * (inner ? 0.75 : 0.42) + eT * (inner ? 0.55 : 0.28);
      s.material.opacity = Math.min(1, base + boost) * mA;
      const bSz = (inner ? 0.45 : 0.9) * shrink;
      s.scale.setScalar(bSz * (1 + sh * (hS ? 1.3 : 0.7)));
    });

    this.systemRings.forEach((ring, i) => {
      if (!this.starsData[i].hasSystem) {
        ring.material.opacity = 0;
        return;
      }
      const sh = this.starHoverT[i];
      const rPulse = 0.5 + 0.5 * Math.sin(now * 0.002 + ring.userData.phase);
      ring.material.opacity = eT * (0.28 * rPulse + sh * 0.6) * mA;
      ring.scale.setScalar(0.55 * shrink * (1 + sh * 0.55 + rPulse * 0.12));
    });

    const LINE_AMBIENT = 0.08;
    const lineOp = Math.max(LINE_AMBIENT, Math.max(h * 0.65, eT * 0.35));
    this.lineMesh.material.opacity = lineOp * mA;
    this.lineMesh.material.color.lerpColors(
      new THREE.Color(0x7788aa),
      new THREE.Color(this.colorHex),
      eT * 0.55,
    );
  }

  getHitArea() {
    return this.hitArea;
  }
  getStarHitMeshes() {
    return this.starHitMeshes;
  }
  getGroup() {
    return this.group;
  }
}