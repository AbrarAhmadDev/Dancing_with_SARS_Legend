import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, ExternalLink, Plus, Minus, Check } from 'lucide-react';
import { scenes, coverage, arrival, riverX } from './spread-model';
import AtlasLocator from './AtlasLocator';
import { countries, DEMO_SECONDS, demoProgress } from './atlas-model';
import './studio-embed.css';
import './atlas.css';

function Landscape({ kind, progress, zoom = 1, opacity = 1, onInspect }) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current, ctx = c.getContext('2d');
    const W = 900, H = 550, step = 3;
    ctx.save(); ctx.clearRect(0, 0, W, H); ctx.translate(W / 2, H / 2); ctx.scale(zoom, zoom); ctx.translate(-W / 2, -H / 2);
    for (let py = 0; py < H; py += step) for (let px = 0; px < W; px += step) {
      const x = px / W, y = py / H;
      const noise = (Math.sin(px * 12.9898 + py * 78.233) * 43758.5453) % 1;
      const relief = 9 * Math.sin(x * 25 + y * 9) + 7 * Math.cos(y * 30 - x * 6) + noise * 6;
      const field = (Math.floor(x * 19) + Math.floor(y * 14)) % 3;
      let rgb = kind === 'flood' ? [43 + relief + field * 7, 82 + relief + field * 6, 48 + relief] : [28 + relief, 67 + relief, 41 + relief];
      const river = Math.abs(x - riverX(y)) < .009;
      if (kind === 'flood' && river) rgb = [39, 117, 153];
      const alpha = coverage(kind, progress, x, y) * opacity;
      const age = progress - arrival(kind, x, y);
      const target = kind === 'flood' ? [34, 137 + 20 * noise, 215 + 12 * noise] : age < .09 ? [255, 126 + noise * 32, 38] : age < .19 ? [192, 64, 31] : [76 + relief / 2, 49, 36];
      ctx.fillStyle = `rgb(${rgb.map((v, i) => v * (1 - alpha) + target[i] * alpha).join(',')})`;
      ctx.fillRect(px, py, step + .3, step + .3);
    }
    ctx.strokeStyle = '#ddd6ae55'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, 435); ctx.bezierCurveTo(250, 310, 560, 390, 900, 270); ctx.stroke();
    if (kind === 'flood') {
      ctx.strokeStyle = '#ccdca122'; ctx.lineWidth = 1;
      for (let i = 0; i < 15; i++) { ctx.beginPath(); ctx.moveTo(i * 72, 0); ctx.lineTo(i * 72 - 100, 550); ctx.stroke(); }
      for (let i = 0; i < 10; i++) { ctx.beginPath(); ctx.moveTo(0, i * 64); ctx.lineTo(900, i * 64 - 30); ctx.stroke(); }
      for (let i = 0; i < 26; i++) { const x = 650 + (i % 6) * 15, y = 360 + Math.floor(i / 6) * 16; ctx.fillStyle = '#c7d0bd'; ctx.fillRect(x, y, 9, 7); }
    }
    ctx.restore();
  }, [kind, progress, zoom, opacity]);
  return <canvas ref={ref} width="900" height="550" role="img" aria-label={`${kind} illustrative landscape at ${Math.round(progress * 100)}% of the sequence`} onClick={e => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - .5) / zoom + .5, y = ((e.clientY - r.top) / r.height - .5) / zoom + .5;
    onInspect?.(coverage(kind, progress, x, y) > .5 ? 'Affected in this simulation' : 'Unchanged at this stage');
  }} />;
}

function Reference({ scene }) {
  return <article className="reference-card"><img src={scene.image} alt={`NASA satellite reference: ${scene.region}, ${scene.imageDate}`} loading="lazy" /><div><small>REAL SATELLITE REFERENCE · {scene.imageDate}</small><h3>{scene.event}</h3><p>{scene.credit}</p><a href={scene.source} target="_blank" rel="noreferrer">Read NASA’s event report <ExternalLink size={14} /></a></div></article>;
}

export default function JapanBrazilAtlas() {
  const [countryId, setCountryId] = useState('japan');
  const [seconds, setSeconds] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [opacity, setOpacity] = useState(.9);
  const [inspect, setInspect] = useState('Click the landscape to inspect a location');
  const country = countries.find(c => c.id === countryId);
  const scene = scenes[country.sceneIndex];
  const progress = demoProgress(seconds);
  const stageIndex = Math.min(4, Math.floor(progress * 4));

  function reset() {
    setPlaying(false); setSeconds(0); setZoom(1); setInspect('Click the landscape to inspect a location');
  }
  function selectCountry(id) {
    if (id !== countryId) reset();
    else setPlaying(false);
    setCountryId(id);
  }

  useEffect(() => {
    if (!playing) return;
    let previous = performance.now(), id;
    const tick = now => {
      const delta = (now - previous) / 1000; previous = now;
      setSeconds(s => Math.min(DEMO_SECONDS, s + delta));
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [playing]);
  useEffect(() => { if (seconds >= DEMO_SECONDS) setPlaying(false); }, [seconds]);
  useEffect(() => {
    const hide = () => { if (document.hidden) setPlaying(false); };
    document.addEventListener('visibilitychange', hide);
    return () => document.removeEventListener('visibilitychange', hide);
  }, []);

  return (
    <section className="content-section japan-brazil-atlas" style={{ '--accent': scene.color }}>
      <div className="section-heading">
        <div>
          <span className="eyebrow">01 / ATLAS</span>
          <h2>Choose a place. Watch it change.</h2>
          <p>Japan flood and Brazil fire demos with 30-second illustrative spread, linked to real NASA reference events.</p>
        </div>
        <div className="cache-pill"><span /> Illustrative demos · Japan + Brazil</div>
      </div>

      <div className="studio" style={{ maxWidth: 'none', margin: 0 }}>
        <AtlasLocator country={country} onSelect={selectCountry} />
        <div className="studio-workspace" id="country-visualization">
          <aside className="scene-sidebar">
            <small>02 / COUNTRY SECTIONS</small>
            {countries.map(c => {
              const s = scenes[c.sceneIndex];
              return (
                <button className={`scene-choice ${country.id === c.id ? 'selected' : ''}`} aria-pressed={country.id === c.id} key={c.id} onClick={() => selectCountry(c.id)}>
                  <img src={s.image} alt="" />
                  <span><small>{c.type.toUpperCase()} · 30 SEC</small><strong>{c.name} / {c.region}</strong><em>{s.event}</em></span>
                  {country.id === c.id && <Check size={17} />}
                </button>
              );
            })}
            <div className="reading">
              <small>WHAT YOU’RE SEEING</small>
              <h3>{scene.title}</h3>
              <p>{scene.description}</p>
              <div className="legend">
                <span><i style={{ background: '#497b40' }} />Vegetation</span>
                <span><i style={{ background: scene.color }} />{scene.id === 'flood' ? 'Floodwater' : 'Active fire / heat colors'}</span>
                {scene.id === 'fire' && <span><i style={{ background: '#674334' }} />Previously affected</span>}
              </div>
              <p className="method-note">Illustrative terrain and progression, not a measured disaster footprint.{scene.id === 'fire' && ' Red/orange indicate simulated fire activity, not measured temperature.'} Reference dates are historical; the animation shows relative stages.</p>
              <a href={scene.source} target="_blank" rel="noreferrer">NASA event reference ↗</a>
            </div>
          </aside>
          <section className="visual-main" aria-label={`${country.name} visualization`}>
            <div className="country-controls">
              <label>Change type
                <select aria-label="Change type" value={country.id} onChange={e => selectCountry(e.target.value)}>
                  {countries.map(c => <option key={c.id} value={c.id}>{c.type} — {c.name}</option>)}
                </select>
              </label>
              <label>Layer opacity <span className="opacity-value">{Math.round(opacity * 100)}%</span>
                <input aria-label="Layer opacity" type="range" min="0" max="1" step=".05" value={opacity} onChange={e => setOpacity(Number(e.target.value))} />
              </label>
            </div>
            <div className="visual-top"><span>{scene.region} <b> / {country.type.toUpperCase()}</b></span><span>ILLUSTRATIVE LANDSCAPE</span></div>
            <div className="landscape">
              <Landscape kind={scene.id} progress={progress} opacity={opacity} zoom={zoom} onInspect={setInspect} />
              <div className="landscape-badge">STAGE {stageIndex + 1} / 5 · {Math.round(progress * 100)}%</div>
              <div className="landscape-tools">
                <button aria-label="Zoom in" onClick={() => setZoom(z => Math.min(2.5, z + .25))}><Plus size={16} /></button>
                <button aria-label="Zoom out" onClick={() => setZoom(z => Math.max(1, z - .25))}><Minus size={16} /></button>
                <button aria-label="Reset zoom" onClick={() => setZoom(1)}><RotateCcw size={16} /></button>
              </div>
              <div className="landscape-caption"><small>{scene.stages[stageIndex]}</small><strong>{scene.title}</strong></div>
            </div>
            <div className="player">
              <div className="play-row">
                <button className="accent" onClick={() => { setSeconds(0); setPlaying(true); }}><Play size={16} />Demo · 30 seconds</button>
                <button aria-label={playing ? 'Pause demo' : 'Resume demo'} disabled={!playing && seconds >= 30} onClick={() => setPlaying(p => !p)}>{playing ? <Pause size={16} /> : <Play size={16} />}</button>
                <button aria-label="Reset demo" onClick={reset}><RotateCcw size={16} /></button>
                <span className="play-time" data-testid="playback-time">{seconds.toFixed(1)}s <span>/ 30.0s</span></span>
              </div>
              <label className="timeline-label">Timeline <span>{playing ? 'Playing' : seconds >= 30 ? 'Complete' : 'Paused'} · presentation time</span>
                <input aria-label="Demo timeline" type="range" min="0" max="30" step=".1" value={seconds} onChange={e => { setPlaying(false); setSeconds(Number(e.target.value)); }} />
              </label>
              <div className="stage-track">
                {scene.stages.map((stage, i) => (
                  <button key={stage} className={stageIndex === i ? 'active' : ''} aria-label={`Go to stage ${i + 1}: ${stage}`} onClick={() => { setPlaying(false); setSeconds([0, 7.5, 15, 22.5, 30][i]); }}>
                    <small>{['00:00', '00:07.5', '00:15', '00:22.5', '00:30'][i]}</small><span>{stage}</span>
                  </button>
                ))}
              </div>
              <p className="inspection" aria-live="polite">{inspect}</p>
            </div>
            <Reference scene={scene} />
          </section>
        </div>
      </div>
    </section>
  );
}
