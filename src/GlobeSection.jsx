import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Html, OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { Droplets, Flame, Pause, Play, Plus, Minus, RotateCcw } from 'lucide-react';
import { EARTH_TEXTURE_MODES, loadEarthTextureByMode } from './lib/gibs-earth';
import { findCountryAt, loadCountryExtra, vectorToLatLon } from './lib/country-pick';
import {
  GLOBE_DEMO_SECONDS,
  floodSeeds,
  fireSeeds,
  globeDemoProgress,
  sectorRadius,
  latLonToPosition,
  floodColor,
  fireColor,
} from './globe-model';
import './globe.css';

const EARTH_RADIUS = 1.6;

function latLonToVector3(lat, lon, radius = EARTH_RADIUS) {
  const [x, y, z] = latLonToPosition(lat, lon, radius);
  return new THREE.Vector3(x, y, z);
}

function ringGeometry(inner, outer, segments = 48) {
  const shape = new THREE.Shape();
  shape.absarc(0, 0, outer, 0, Math.PI * 2, false);
  const hole = new THREE.Path();
  hole.absarc(0, 0, Math.max(0.001, inner), 0, Math.PI * 2, true);
  shape.holes.push(hole);
  return new THREE.ShapeGeometry(shape, segments);
}

function EarthSphere({ textureMode, onHover, onTextureReady }) {
  const materialRef = useRef(null);
  const [texture, setTexture] = useState(null);
  const [textureLabel, setTextureLabel] = useState('Loading Earth map…');

  useEffect(() => {
    let alive = true;
    setTextureLabel(`Loading ${EARTH_TEXTURE_MODES[textureMode]?.short || 'Earth'}…`);
    loadEarthTextureByMode(textureMode).then((tex) => {
      if (!alive) return;
      setTexture(tex);
      const label = tex.userData?.source || 'Earth texture';
      setTextureLabel(label);
      onTextureReady?.(label);
    });
    return () => {
      alive = false;
    };
  }, [textureMode, onTextureReady]);

  useEffect(() => {
    const material = materialRef.current;
    if (!material) return;
    material.map = texture || null;
    material.color.set(texture ? '#ffffff' : '#1a6fa0');
    material.needsUpdate = true;
  }, [texture]);

  function handlePointerMove(event) {
    event.stopPropagation();
    const { lat, lon } = vectorToLatLon(event.point, EARTH_RADIUS);
    const country = findCountryAt(lat, lon);
    onHover?.({
      country,
      lat,
      lon,
      clientX: event.clientX,
      clientY: event.clientY,
      textureLabel,
    });
  }

  function handlePointerOut() {
    onHover?.(null);
  }

  return (
    <group>
      <mesh
        onPointerMove={handlePointerMove}
        onPointerOut={handlePointerOut}
        onPointerOver={handlePointerMove}
      >
        <sphereGeometry args={[EARTH_RADIUS, 96, 96]} />
        <meshStandardMaterial
          ref={materialRef}
          map={texture || undefined}
          color={texture ? '#ffffff' : '#1a6fa0'}
          roughness={0.72}
          metalness={0.02}
          toneMapped
        />
      </mesh>
    </group>
  );
}

function SectorMarker({ seed, mode, progress, countryName }) {
  const group = useRef();
  const radius = sectorRadius(progress, seed.strength);
  const color = mode === 'flood' ? floodColor(progress) : fireColor(progress);
  const position = useMemo(() => latLonToVector3(seed.lat, seed.lon, EARTH_RADIUS * 1.01), [seed.lat, seed.lon]);
  const disc = useMemo(() => new THREE.CircleGeometry(radius, 36), [radius]);
  const ring = useMemo(() => ringGeometry(radius * 0.72, radius, 40), [radius]);
  const showLabel = progress > 0.04;

  useEffect(() => () => {
    disc.dispose();
    ring.dispose();
  }, [disc, ring]);

  useEffect(() => {
    if (!group.current) return;
    const normal = position.clone().normalize();
    group.current.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
  }, [position]);

  return (
    <group ref={group} position={position}>
      <mesh geometry={disc} renderOrder={2} raycast={() => null}>
        <meshBasicMaterial color={color} transparent opacity={mode === 'flood' ? 0.72 : 0.78} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh geometry={ring} position={[0, 0, 0.002]} renderOrder={3} raycast={() => null}>
        <meshBasicMaterial
          color={mode === 'flood' ? '#fff3a8' : '#ffd0a8'}
          transparent
          opacity={0.9}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, 0, 0.01]} raycast={() => null}>
        <sphereGeometry args={[0.018, 12, 12]} />
        <meshBasicMaterial color={mode === 'flood' ? '#ffe566' : '#ff4d2e'} />
      </mesh>
      {showLabel && countryName && (
        <Html
          position={[0, 0, radius + 0.05]}
          center
          distanceFactor={6.5}
          style={{ pointerEvents: 'none' }}
          zIndexRange={[20, 0]}
        >
          <div className={`globe-seed-label ${mode}`}>
            <strong>{countryName}</strong>
            <span>{seed.label}</span>
          </div>
        </Html>
      )}
    </group>
  );
}

function DemoSectors({ mode, progress }) {
  if (!mode || progress <= 0) return null;
  const seeds = mode === 'flood' ? floodSeeds : fireSeeds;
  return (
    <group>
      {seeds.map((seed) => {
        const country = findCountryAt(seed.lat, seed.lon);
        return (
          <SectorMarker
            key={seed.id}
            seed={seed}
            mode={mode}
            progress={progress}
            countryName={country?.name || seed.label}
          />
        );
      })}
    </group>
  );
}

function Scene({ mode, progress, controlsRef, autoSpin, textureMode, whiteBackground, onHover, onTextureReady }) {
  return (
    <>
      <color attach="background" args={[whiteBackground ? '#ffffff' : '#07111f']} />
      <ambientLight intensity={whiteBackground ? 1.15 : 0.95} />
      <directionalLight position={[5, 3, 2]} intensity={whiteBackground ? 1.25 : 1.55} />
      <directionalLight position={[-4, -2, -3]} intensity={0.45} color="#b7d9ff" />
      <hemisphereLight args={['#d7ebff', '#1a3d28', whiteBackground ? 0.55 : 0.45]} />
      {!whiteBackground && (
        <Stars radius={80} depth={40} count={1800} factor={3} saturation={0} fade speed={0.4} />
      )}
      <EarthSphere textureMode={textureMode} onHover={onHover} onTextureReady={onTextureReady} />
      <DemoSectors mode={mode} progress={progress} />
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.55}
        minDistance={2.4}
        maxDistance={7.5}
        autoRotate={autoSpin}
        autoRotateSpeed={0.55}
      />
    </>
  );
}

export default function GlobeSection() {
  const controlsRef = useRef(null);
  const stageRef = useRef(null);
  const [mode, setMode] = useState(null);
  const [seconds, setSeconds] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [autoSpin, setAutoSpin] = useState(true);
  const [hover, setHover] = useState(null);
  const [extra, setExtra] = useState(null);
  const [mapSource, setMapSource] = useState('Loading Earth map…');
  const [textureMode, setTextureMode] = useState('synced');
  const [whiteBackground, setWhiteBackground] = useState(false);
  const progress = globeDemoProgress(seconds);
  const onTextureReady = useMemo(() => (label) => setMapSource(label), []);

  useEffect(() => {
    if (!hover?.country?.code) {
      setExtra(null);
      return undefined;
    }
    let alive = true;
    loadCountryExtra(hover.country.code).then((data) => {
      if (alive) setExtra(data);
    });
    return () => { alive = false; };
  }, [hover?.country?.code]);

  function handleGlobeHover(payload) {
    if (!payload) {
      setHover(null);
      return;
    }
    if (payload.textureLabel) setMapSource(payload.textureLabel);
    const rect = stageRef.current?.getBoundingClientRect();
    setHover({
      country: payload.country,
      lat: payload.lat,
      lon: payload.lon,
      x: rect ? payload.clientX - rect.left : payload.clientX,
      y: rect ? payload.clientY - rect.top : payload.clientY,
    });
  }

  useEffect(() => {
    if (!playing) return undefined;
    let previous = performance.now();
    let frame;
    const tick = (now) => {
      const delta = (now - previous) / 1000;
      previous = now;
      setSeconds((value) => {
        const next = Math.min(GLOBE_DEMO_SECONDS, value + delta);
        if (next >= GLOBE_DEMO_SECONDS) setPlaying(false);
        return next;
      });
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing]);

  useEffect(() => {
    const hide = () => { if (document.hidden) setPlaying(false); };
    document.addEventListener('visibilitychange', hide);
    return () => document.removeEventListener('visibilitychange', hide);
  }, []);

  function focusSeed(seed) {
    const controls = controlsRef.current;
    if (!controls || !seed) return;
    const target = latLonToVector3(seed.lat, seed.lon, 0);
    const cameraPos = latLonToVector3(seed.lat, seed.lon, 4.2);
    controls.target.copy(target);
    controls.object.position.copy(cameraPos);
    controls.update();
  }

  function startDemo(nextMode) {
    const seeds = nextMode === 'flood' ? floodSeeds : fireSeeds;
    setMode(nextMode);
    setSeconds(0);
    setPlaying(true);
    setAutoSpin(false);
    focusSeed(seeds[0]);
  }

  function resetDemo() {
    setPlaying(false);
    setSeconds(0);
    setMode(null);
    setAutoSpin(true);
  }

  function zoomBy(factor) {
    const controls = controlsRef.current;
    if (!controls) return;
    const camera = controls.object;
    const direction = new THREE.Vector3().subVectors(camera.position, controls.target);
    direction.multiplyScalar(factor);
    camera.position.copy(controls.target).add(direction);
    controls.update();
  }

  function resetView() {
    const controls = controlsRef.current;
    if (!controls) return;
    controls.reset();
    setAutoSpin(true);
  }

  const statusLabel = !mode
    ? 'Rotate freely · pick a demo when ready'
    : playing
      ? `${mode === 'flood' ? 'Flood' : 'Fire'} demo playing`
      : seconds >= GLOBE_DEMO_SECONDS
        ? `${mode === 'flood' ? 'Flood' : 'Fire'} demo complete`
        : `${mode === 'flood' ? 'Flood' : 'Fire'} demo paused`;

  return (
    <section className="content-section globe-section" aria-label="3D world globe">
      <div className="section-heading">
        <div>
          <span className="eyebrow">3D GLOBE</span>
          <h2>Spin the Earth, then run one demo</h2>
          <p>
            Switch between the synced Natural Earth map and the full real Blue Marble photo. Flood/fire demos are
            teaching overlays, not measured disaster maps.
          </p>
        </div>
        <div className="cache-pill"><span /> Two Earth modes</div>
      </div>

      <div className="globe-stage">
        <aside className="globe-controls">
          <div>
            <span className="workspace-kicker">CONTROLS</span>
            <h3>One demo at a time</h3>
            <p>Hover land for country names. Flood and fire never run together.</p>
          </div>

          <div className="globe-texture-modes" role="group" aria-label="Earth texture mode">
            <span className="workspace-kicker">EARTH MAP</span>
            <div className="globe-texture-toggle">
              {Object.values(EARTH_TEXTURE_MODES).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={textureMode === item.id ? 'is-active' : ''}
                  onClick={() => setTextureMode(item.id)}
                  aria-pressed={textureMode === item.id}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <p>{EARTH_TEXTURE_MODES[textureMode]?.description}</p>
            <label className="globe-check">
              <input
                type="checkbox"
                checked={whiteBackground}
                onChange={(event) => setWhiteBackground(event.target.checked)}
              />
              White background behind Earth
            </label>
          </div>

          <div className="globe-demo-stack">
            <article className={`globe-demo-card ${mode === 'flood' ? 'is-active-flood' : ''}`}>
              <header>
                <strong><span className="globe-swatch flood" aria-hidden /> Flooding</strong>
                <small>YELLOW SECTORS</small>
              </header>
              <p>Yellow sectors expand on the GIBS Blue Marble globe. Country names appear on each seed as the demo runs.</p>
              <div className="globe-demo-actions">
                <button type="button" className="flood-btn" onClick={() => startDemo('flood')}>
                  <Droplets size={14} /> Demo flooding
                </button>
                {mode === 'flood' && (
                  <button type="button" className="ghost" onClick={() => setPlaying((value) => !value)}>
                    {playing ? <Pause size={14} /> : <Play size={14} />} {playing ? 'Pause' : 'Resume'}
                  </button>
                )}
              </div>
            </article>

            <article className={`globe-demo-card ${mode === 'fire' ? 'is-active-fire' : ''}`}>
              <header>
                <strong><span className="globe-swatch fire" aria-hidden /> Forest fires</strong>
                <small>ORANGE → RED</small>
              </header>
              <p>Orange-to-red fronts on the same GIBS Earth. Country labels stay pinned to each fire seed.</p>
              <div className="globe-demo-actions">
                <button type="button" className="fire-btn" onClick={() => startDemo('fire')}>
                  <Flame size={14} /> Demo fire
                </button>
                {mode === 'fire' && (
                  <button type="button" className="ghost" onClick={() => setPlaying((value) => !value)}>
                    {playing ? <Pause size={14} /> : <Play size={14} />} {playing ? 'Pause' : 'Resume'}
                  </button>
                )}
              </div>
            </article>
          </div>

          {(mode || seconds > 0) && (
            <label>
              <span>Demo timeline · {seconds.toFixed(1)}s / {GLOBE_DEMO_SECONDS}.0s</span>
              <input
                className="globe-progress"
                aria-label="Globe demo timeline"
                type="range"
                min="0"
                max={GLOBE_DEMO_SECONDS}
                step="0.1"
                value={seconds}
                onChange={(event) => {
                  setPlaying(false);
                  setSeconds(Number(event.target.value));
                }}
              />
            </label>
          )}

          <div className="globe-demo-actions">
            <button type="button" className="ghost" onClick={resetDemo}>
              <RotateCcw size={14} /> Clear demo
            </button>
            <button type="button" className="ghost" onClick={() => setAutoSpin((value) => !value)}>
              {autoSpin ? 'Stop auto-spin' : 'Auto-spin'}
            </button>
          </div>

          {mode && (
            <div className="globe-demo-countries" aria-live="polite">
              <span className="workspace-kicker">{mode === 'flood' ? 'FLOOD SEEDS' : 'FIRE SEEDS'}</span>
              <ul>
                {(mode === 'flood' ? floodSeeds : fireSeeds).map((seed) => {
                  const country = findCountryAt(seed.lat, seed.lon);
                  return (
                    <li key={seed.id}>
                      <button type="button" onClick={() => focusSeed(seed)}>
                        <b>{country?.name || seed.label}</b>
                        <span>{seed.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div className="globe-meta">
            <div><b>Status:</b> {statusLabel}</div>
            <div><b>Basemap:</b> {mapSource}</div>
            <div><b>Honesty:</b> Sector locations are teaching seeds, not verified event perimeters.</div>
          </div>
        </aside>

        <div className={`globe-canvas-wrap${whiteBackground ? ' is-white-bg' : ''}`} ref={stageRef}>
          <Canvas camera={{ position: [0, 0.4, 4.8], fov: 42 }} dpr={[1, 1.75]} gl={{ antialias: true }}>
            <Suspense fallback={null}>
              <Scene
                mode={mode}
                progress={progress}
                controlsRef={controlsRef}
                autoSpin={autoSpin && !playing}
                textureMode={textureMode}
                whiteBackground={whiteBackground}
                onHover={handleGlobeHover}
                onTextureReady={onTextureReady}
              />
            </Suspense>
          </Canvas>

          <div className="globe-zoom-tools" aria-label="Globe zoom controls">
            <button type="button" aria-label="Zoom in" onClick={() => zoomBy(0.85)}><Plus size={16} /></button>
            <button type="button" aria-label="Zoom out" onClick={() => zoomBy(1.18)}><Minus size={16} /></button>
            <button type="button" aria-label="Reset globe view" onClick={resetView}><RotateCcw size={16} /></button>
          </div>

          {hover?.country && (
            <div
              className="globe-country-tip"
              style={{ left: Math.min(hover.x + 14, (stageRef.current?.clientWidth || 320) - 180), top: Math.max(12, hover.y - 12) }}
              role="status"
            >
              <strong>{hover.country.name}</strong>
              <span>{hover.country.code || '—'} · {hover.lat.toFixed(1)}°, {hover.lon.toFixed(1)}°</span>
              {extra?.capital && <span>Capital {extra.capital}</span>}
              {extra?.region && <span>{extra.region}</span>}
              {typeof extra?.population === 'number' && (
                <span>Pop. {extra.population.toLocaleString()}</span>
              )}
            </div>
          )}

          <div className="globe-hud">
            <span>Drag to rotate · hover land for country</span>
            <strong>
              {mode === 'flood' && `Flood coverage ~${Math.round(progress * 100)}%`}
              {mode === 'fire' && `Fire coverage ~${Math.round(progress * 100)}%`}
              {!mode && (hover?.country ? hover.country.name : 'No demo active')}
            </strong>
          </div>
        </div>
      </div>
    </section>
  );
}
