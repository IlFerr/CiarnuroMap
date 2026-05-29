import * as THREE from "three";
import { getFresnelMat } from "../getFresnelMat.js";
import { resolveTexturePath } from "../utils/texturePath.js";

const DEFAULT_DETAIL = 12;
const DEFAULT_BUMP_SCALE = 0.04;

export function createPlanet(options = {}) {
  const {
    scene,
    diameter = 1,
    sunDistance = 0,
    baseTexture = null,
    bumpTexture = null,
    cloudTexture = null,
    dumpCloudTexture = null,
    lightTexture = null,
    planetDistance = null,
    detail = DEFAULT_DETAIL,
    nbumpScale = DEFAULT_BUMP_SCALE,
    textureLoader = new THREE.TextureLoader(),
  } = options;

  const group = new THREE.Group();
  scene.add(group);

  const geometry = new THREE.IcosahedronGeometry(
    Math.max(0.001, diameter / 1000),
    detail,
  );

  const baseMapPath = resolveTexturePath(baseTexture);
  const bumpMapPath = resolveTexturePath(bumpTexture);
  const lightMapPath = lightTexture ? resolveTexturePath(lightTexture) : null;

  const isStar = parseFloat(sunDistance) === 0;

  let material;
  if (isStar) {
    material = new THREE.MeshStandardMaterial({
      map: baseMapPath ? textureLoader.load(baseMapPath) : null,
      emissive: new THREE.Color(0xffffff),
      emissiveMap: lightMapPath ? textureLoader.load(lightMapPath) : null,
      emissiveIntensity: 0.5,
      metalness: 0.0,
      roughness: 1.0,
    });
  } else {
    material = new THREE.MeshPhongMaterial({
      map: baseMapPath ? textureLoader.load(baseMapPath) : null,
      bumpMap: bumpMapPath ? textureLoader.load(bumpMapPath) : null,
      bumpScale: nbumpScale,
    });
  }

  const mesh = new THREE.Mesh(geometry, material);
  mesh.userData.parentGroup = group;
  group.mesh = mesh;
  group.add(mesh);

  if (lightMapPath) {
    const lightsMesh = new THREE.Mesh(
      geometry.clone(),
      new THREE.MeshBasicMaterial({
        map: textureLoader.load(lightMapPath),
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
      }),
    );
    lightsMesh.userData.parentGroup = group;
    lightsMesh.scale.setScalar(1.001);
    group.lightsMesh = lightsMesh;
    group.add(lightsMesh);
  }

  // clouds
  if (cloudTexture || dumpCloudTexture) {
    const cloudsMesh = new THREE.Mesh(
      geometry.clone(),
      new THREE.MeshStandardMaterial({
        map: cloudTexture
          ? textureLoader.load(resolveTexturePath(cloudTexture))
          : null,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        alphaMap: dumpCloudTexture
          ? textureLoader.load(resolveTexturePath(dumpCloudTexture))
          : null,
      }),
    );
    cloudsMesh.scale.setScalar(1.003);
    cloudsMesh.userData.parentGroup = group;
    group.cloudsMesh = cloudsMesh;
    group.add(cloudsMesh);
  }

  // glow Fresnel
  try {
    const glowMesh = new THREE.Mesh(geometry.clone(), getFresnelMat());
    glowMesh.scale.setScalar(1.01);
    glowMesh.userData.parentGroup = group;
    group.glowMesh = glowMesh;
    group.add(glowMesh);
  } catch (err) {
    console.warn("getFresnelMat failed or not present:", err);
  }

  if (isStar) {
    const starRadius = Math.max(0.001, diameter / 1000);
    const lightDistance = Math.max(100, diameter * 10);
    const intensity = Math.max(13.0, diameter / 50);
    const decay = 0.8;

    const pointLight = new THREE.PointLight(
      0xffffff,
      intensity,
      lightDistance,
      decay,
    );
    pointLight.position.set(0, 0, 0);
    pointLight.castShadow = false;

    const lightBulb = new THREE.Mesh(
      new THREE.SphereGeometry(starRadius * 0.2, 8, 8),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        blending: THREE.AdditiveBlending,
      }),
    );
    lightBulb.userData.parentGroup = group;
    lightBulb.scale.setScalar(1.0);
    group.add(lightBulb);

    group.add(pointLight);
    group.userData.pointLight = pointLight;
  }

  return group;
}
