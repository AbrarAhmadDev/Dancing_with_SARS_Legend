import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Play, Pause, RotateCcw, Waves, Satellite, Database, ShieldCheck } from 'lucide-react';
import { frames } from './data';
import './styles.css';

function FloodMap({ intensity }) {
  const cells = useMemo(() => Array.from({ length: 120 }, (_, i) => {
    const x = i % 15, y = Math.floor(i / 15);
    const river = Math.abs(y - (7 + Math.sin(x / 2) * 2)) < 1.8;
    const flood = river || (intensity > 45 && ((x * 7 + y * 13) % 100) < intensity * 0.72);
    return { x, y, flood };
  }), [intensity]);
  return <div className="map" role="img" aria-label={`Flood extent visualization at ${intensity}% intensity`}>
    <div className="map-grid">{cells.map((c, i) => <span key={i} className={c.flood ? 'cell flood' : 'cell'} />)}</div>
    <div className="map-label"><span className="legend-dot flood-dot" /> detected surface water</div>
    <div className="map-coordinates">DEMO AOI · 10 m equivalent display</div>
  </div>;
}

function App() {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [cached, setCached] = useState(() => localStorage.getItem('flood-demo-cache') === 'ready');
  const frame = frames[index];

  useEffect(() => {
    if (!playing) return undefined;
    const timer = setInterval(() => setIndex((value) => {
      if (value === frames.length - 1) { setPlaying(false); return value; }
      return value + 1;
    }), 1100);
    return () => clearInterval(timer);
  }, [playing]);

  function runDemo() {
    localStorage.setItem('flood-demo-cache', 'ready');
    setCached(true); setIndex(0); setPlaying(true);
  }

  return <main>
    <nav><div className="brand"><Waves size={20} /> DANCING WITH THE SARs</div><div className="nav-tag">NASA SPACE APPS · FLOOD PULSE</div></nav>
    <section className="hero">
      <div className="eyebrow">SURFACE CHANGE / 01</div>
      <h1>When the river<br /><em>steps beyond its banks.</em></h1>
      <p className="lede">A time-aware flood story built from radar observations. Move through the event and watch surface water expand, peak, and recede.</p>
      <div className="actions"><button className="primary" onClick={runDemo}>{playing ? <Pause size={16} /> : <Play size={16} />} {playing ? 'Playing demo' : 'Play full demo'}</button><button className="ghost" onClick={() => { setPlaying(false); setIndex(0); }}><RotateCcw size={15} /> Reset</button></div>
      <div className="status"><span className="pulse" /> {cached ? 'Demo cached locally · instant replay enabled' : 'First replay will cache locally'}</div>
    </section>
    <section className="dashboard">
      <div className="dash-head"><div><div className="eyebrow">EVENT TIMELINE</div><h2>Flood pulse · lower valley</h2></div><div className="source"><Satellite size={16} /> SAR change detection</div></div>
      <div className="timeline"><div className="timeline-line" style={{ width: `${(index / (frames.length - 1)) * 100}%` }} />{frames.map((item, i) => <button key={item.date} className={`tick ${i === index ? 'active' : ''}`} onClick={() => { setPlaying(false); setIndex(i); }}><span className="tick-dot" /><small>{item.date.slice(5)}</small><b>{item.label}</b></button>)}</div>
      <div className="visual-grid"><FloodMap intensity={frame.area} /><aside className="metrics"><div className="metric-kicker">CURRENT OBSERVATION</div><h3>{frame.label}</h3><p>{frame.note}</p><div className="metric"><span>Surface water extent</span><strong>{frame.area}<small>%</small></strong><div className="bar"><i style={{ width: `${frame.area}%` }} /></div></div><div className="metric"><span>7-day rainfall index</span><strong>{frame.rain}<small> / 100</small></strong><div className="bar warm"><i style={{ width: `${frame.rain}%` }} /></div></div><div className="callout"><ShieldCheck size={17} /><span>Observation gap policy: missing dates remain gaps; no synthetic image is presented as satellite evidence.</span></div></aside></div>
      <div className="data-strip"><div><Database size={16} /><span><b>Demo mode</b> · deterministic placeholder frames</span></div><span>Production adapters: NISAR · Sentinel-1 · OPERA DSWx-S1</span></div>
    </section>
    <footer><span>Built for “Dancing with the SARs”</span><span>NASA data will be credited per product metadata · <a href="https://nisar.jpl.nasa.gov/" target="_blank" rel="noreferrer">mission context</a></span></footer>
  </main>;
}

createRoot(document.getElementById('root')).render(<App />);
