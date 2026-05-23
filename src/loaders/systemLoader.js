// src/loaders/systemLoader.js
import { createPlanet } from "../factories/planetFactory.js";
import { createAsteroids } from "../factories/asteroidFactory.js";
import { resolveTexturePath } from "../utils/texturePath.js";

const POSITION_SCALE_FACTOR = 10; // come nel codice originale

export async function loadSystem({ url, scene, textureLoader }) {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const d = await res.json();

    const groups = [];

    if (d.celestialBodies && Array.isArray(d.celestialBodies)) {
      for (const f of d.celestialBodies) {
        const diameter = parseFloat(f.diameter) || 0;
        const sunDistance = parseFloat(f.sunDistance) || 0;
        const planetDistance =
          f.PlanetDistance != null ? parseFloat(f.PlanetDistance) : null;

        const planetGroup = createPlanet({
          scene,
          diameter,
          sunDistance,
          baseTexture: f.baseTexture,
          bumpTexture: f.bumpTexture,
          cloudTexture: f.cloudTexture,
          dumpCloudTexture: f.dumpCloudTexture,
          lightTexture: f.lightTexture,
          planetDistance,
          textureLoader,
        });

        if (planetGroup) {
          // salva info
          planetGroup.userData.info = {
            name: f.name,
            description: f.description,
            type: f.type,
            diameter,
            sunDistance,
            baseTexture: f.baseTexture,
            bumpTexture: f.bumpTexture,
            cloudTexture: f.cloudTexture,
            dumpCloudTexture: f.dumpCloudTexture,
            lightTexture: f.lightTexture,
            planetDistance: planetDistance,
          };

          // POSIZIONAMENTO: scala e offset per i satelliti
          // basePos: posizionamento radiale della pianeta rispetto alla stella
          const scaleFactor = POSITION_SCALE_FACTOR;
          const basePos = (sunDistance || 0) / scaleFactor;
          const moonOffset = planetDistance != null ? planetDistance : 0;
          planetGroup.position.x = basePos + moonOffset;

          groups.push(planetGroup);
        }
      }
    }

    if (d.asteroid && Array.isArray(d.asteroid)) {
      for (const a of d.asteroid) {
        const distance = parseFloat(a.distance) || 0;
        const belt = createAsteroids({ scene, distance });
        if (belt) groups.push(belt);
      }
    }

    return groups;
  } catch (e) {
    console.error("Errore nel caricamento del sistema:", e);
    return [];
  }
}
