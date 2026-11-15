import * as THREE from 'three';
import {
  createEarthTexture,
  createLandMaskCanvas,
  paintOceanLandBase,
  strokeCountryBorders,
} from '../earth-texture';

/** Equirectangular map for the sphere (same lon/lat frame as country picking). */
const TEXTURE_WIDTH = 2048;
const TEXTURE_HEIGHT = 1024;

/** Local real-Earth photo. */
const LOCAL_BLUE_MARBLE = '/textures/earth-blue-marble.jpg';

export const EARTH_TEXTURE_MODES = {
  synced: {
    id: 'synced',
    label: 'Synced map',
    short: 'Synced',
    description: 'Natural Earth coasts with Blue Marble land detail',
  },
  photo: {
    id: 'photo',
    label: 'Real Blue Marble',
    short: 'Photo',
    description: 'Full photographic Blue Marble on the sphere',
  },
};

const textureCache = new Map();

function cmrBase() {
  return import.meta.env.DEV ? '/api/cmr' : 'https://cmr.earthdata.nasa.gov';
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Image failed: ${url}`));
    img.src = url;
  });
}

function finishTexture(canvas, meta = {}) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.flipY = true;
  texture.needsUpdate = true;
  texture.userData = {
    size: `${TEXTURE_WIDTH}×${TEXTURE_HEIGHT}`,
    ...meta,
  };
  return texture;
}

export async function verifyEarthdataToken() {
  try {
    const response = await fetch(
      `${cmrBase()}/search/collections.json?keyword=Blue%20Marble&page_size=1`,
      { headers: { Accept: 'application/json' } },
    );
    if (!response.ok) return { ok: false, status: response.status };
    const json = await response.json();
    return { ok: true, title: json?.feed?.entry?.[0]?.title || 'CMR OK' };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

/** Mode 1 — synced Natural Earth structure + Blue Marble land detail. */
export async function loadSyncedEarthTexture() {
  const auth = await verifyEarthdataToken();
  const photo = await loadImage(LOCAL_BLUE_MARBLE);

  const canvas = document.createElement('canvas');
  canvas.width = TEXTURE_WIDTH;
  canvas.height = TEXTURE_HEIGHT;
  const ctx = canvas.getContext('2d');

  paintOceanLandBase(ctx, TEXTURE_WIDTH, TEXTURE_HEIGHT);

  const photoCanvas = document.createElement('canvas');
  photoCanvas.width = TEXTURE_WIDTH;
  photoCanvas.height = TEXTURE_HEIGHT;
  const photoCtx = photoCanvas.getContext('2d');
  photoCtx.drawImage(photo, 0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT);

  const base = ctx.getImageData(0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT);
  const photoData = photoCtx.getImageData(0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT).data;
  const mask = createLandMaskCanvas(TEXTURE_WIDTH, TEXTURE_HEIGHT)
    .getContext('2d')
    .getImageData(0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT).data;
  const pixels = base.data;

  for (let i = 0; i < pixels.length; i += 4) {
    if (mask[i] < 128) continue;
    pixels[i] = Math.round(pixels[i] * 0.35 + photoData[i] * 0.65);
    pixels[i + 1] = Math.round(pixels[i + 1] * 0.35 + photoData[i + 1] * 0.65);
    pixels[i + 2] = Math.round(pixels[i + 2] * 0.35 + photoData[i + 2] * 0.65);
  }
  ctx.putImageData(base, 0, 0);
  strokeCountryBorders(ctx, TEXTURE_WIDTH, TEXTURE_HEIGHT, 'rgba(255, 255, 255, 0.7)');

  return finishTexture(canvas, {
    mode: 'synced',
    source: 'Synced Blue Marble · Natural Earth coasts',
    layer: 'earth-blue-marble+natural-earth',
    aligned: true,
    cmr: auth.ok ? auth.title : null,
    earthdataAuth: auth.ok,
  });
}

/** Mode 2 — full real Blue Marble photograph on the sphere. */
export async function loadPhotoEarthTexture() {
  const auth = await verifyEarthdataToken();
  const photo = await loadImage(LOCAL_BLUE_MARBLE);

  const canvas = document.createElement('canvas');
  canvas.width = TEXTURE_WIDTH;
  canvas.height = TEXTURE_HEIGHT;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#0a3d5c';
  ctx.fillRect(0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT);
  ctx.drawImage(photo, 0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT);

  return finishTexture(canvas, {
    mode: 'photo',
    source: 'Real Blue Marble photo',
    layer: 'earth-blue-marble',
    aligned: false,
    cmr: auth.ok ? auth.title : null,
    earthdataAuth: auth.ok,
  });
}

export async function loadEarthTextureByMode(mode = 'synced') {
  const key = mode === 'photo' ? 'photo' : 'synced';
  if (textureCache.has(key)) {
    return textureCache.get(key);
  }

  try {
    const texture = key === 'photo'
      ? await loadPhotoEarthTexture()
      : await loadSyncedEarthTexture();
    textureCache.set(key, texture);
    return texture;
  } catch (error) {
    console.warn(`[globe] ${key} texture failed, using drawn fallback.`, error);
    const texture = createEarthTexture(TEXTURE_WIDTH, TEXTURE_HEIGHT);
    texture.userData = {
      mode: key,
      source: key === 'photo' ? 'Drawn fallback' : 'Natural Earth synced fallback',
      layer: 'drawn',
      aligned: key === 'synced',
    };
    return texture;
  }
}

/** @deprecated Prefer loadEarthTextureByMode */
export async function loadGibsEarthTexture() {
  return loadEarthTextureByMode('synced');
}

export async function loadEarthTextureWithFallback() {
  return loadEarthTextureByMode('synced');
}
