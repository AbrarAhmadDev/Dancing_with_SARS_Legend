import * as THREE from 'three';
import world from './data/world.json';

/** Same equirectangular mapping as the 3D globe UVs / country outlines. */
export function equirectProject(lon, lat, width, height) {
  const x = ((lon + 180) / 360) * width;
  const y = ((90 - lat) / 180) * height;
  return [x, y];
}

function projectPoint([lon, lat], width, height) {
  return equirectProject(lon, lat, width, height);
}

function drawRing(ctx, ring, width, height, fill, stroke) {
  if (!ring?.length) return;
  ctx.beginPath();
  ring.forEach((point, index) => {
    const [x, y] = projectPoint(point, width, height);
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = Math.max(0.6, width / 1400);
    ctx.stroke();
  }
}

function paintContinents(ctx, width, height, { landFill, holeFill, stroke }) {
  for (const feature of world.features) {
    const { type, coordinates } = feature.geometry;
    if (type === 'Polygon') {
      coordinates.forEach((ring, index) => drawRing(ctx, ring, width, height, index === 0 ? landFill : holeFill, stroke));
    } else if (type === 'MultiPolygon') {
      coordinates.forEach((poly) => {
        poly.forEach((ring, index) => drawRing(ctx, ring, width, height, index === 0 ? landFill : holeFill, stroke));
      });
    }
  }
}

/** Equirectangular canvas: deep blue oceans + green land from Natural Earth. */
export function paintOceanLandBase(ctx, width, height) {
  const ocean = ctx.createLinearGradient(0, 0, 0, height);
  ocean.addColorStop(0, '#074a6e');
  ocean.addColorStop(0.35, '#1a7aad');
  ocean.addColorStop(0.55, '#1b82b5');
  ocean.addColorStop(1, '#074a6e');
  ctx.fillStyle = ocean;
  ctx.fillRect(0, 0, width, height);

  // Soft latitude banding on oceans
  ctx.fillStyle = 'rgba(4, 35, 58, 0.14)';
  for (let y = 0; y < height; y += 22) ctx.fillRect(0, y, width, 8);

  paintContinents(ctx, width, height, {
    landFill: '#3f9a4a',
    holeFill: '#1a7aad',
    stroke: '#2f6f38',
  });

  // Inland variety (darker forest + lighter grass) via second light pass
  ctx.globalAlpha = 0.22;
  paintContinents(ctx, width, height, {
    landFill: '#2f7a3a',
    holeFill: 'rgba(0,0,0,0)',
    stroke: null,
  });
  ctx.globalAlpha = 1;

  const poles = ctx.createLinearGradient(0, 0, 0, height);
  poles.addColorStop(0, 'rgba(230, 242, 250, 0.34)');
  poles.addColorStop(0.1, 'rgba(230, 242, 250, 0)');
  poles.addColorStop(0.9, 'rgba(230, 242, 250, 0)');
  poles.addColorStop(1, 'rgba(230, 242, 250, 0.34)');
  ctx.fillStyle = poles;
  ctx.fillRect(0, 0, width, height);
}

/** Binary land mask: white = land, black = ocean. */
export function createLandMaskCanvas(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, width, height);
  paintContinents(ctx, width, height, {
    landFill: '#fff',
    holeFill: '#000',
    stroke: null,
  });
  return canvas;
}

/** Stroke Natural Earth borders — identical lon/lat mapping as GlobeSection LandMasses. */
export function strokeCountryBorders(ctx, width, height, color = 'rgba(235, 245, 240, 0.55)') {
  paintContinents(ctx, width, height, {
    landFill: null,
    holeFill: null,
    stroke: color,
  });
}

export function createEarthTexture(width = 1024, height = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  paintOceanLandBase(ctx, width, height);
  strokeCountryBorders(ctx, width, height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}
