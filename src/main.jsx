import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Play, Pause, RotateCcw, Waves, Satellite, Database, ShieldCheck } from 'lucide-react';
import { frames } from './data';
import { loadObservations } from './lib/observations';
import './styles.css';
import './raster.css';

function FloodMap({ frame }) {
  return <div className="map" role="img" aria-label={`${frame.label} flood extent from NASA OPERA`}>
    <img className="raster" src={frame.image} alt="" />
    <div className="map-label"><span className="legend-dot flood-dot" /> detected surface water</div>
    <div className="map-coordinates">DEMO AOI · 10 m equivalent display</div>
  </div>;
}

function App() {
  const [index, setIndex] = useState(0);
  const [timeline, setTimeline] = useState(frames);
  const [playing, setPlaying] = useState(false);
  const [cached, setCached] = useState(() => localStorage.getItem('flood-demo-cache') === 'ready');
  const frame = timeline[index] ?? timeline[0];

  useEffect(() => {
    loadObservations('brazil-flood-2024').then((result) => {
      if (result.source === 'supabase' && result.frames.length) {
        setTimeline(result.frames.map((item) => ({
          date: item.observed_at.slice(0, 10),
          label: item.product || 'Observation',
          image: item.asset_url,
          note: `${item.sensor || 'SAR'} observation`
        })).filter((item) => item.image));
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!playing) return undefined;
    const timer = setInterval(() => setIndex((value) => {
      if (value === timeline.length - 1) { setPlaying(false); return value; }
      return value + 1;
    }), 1100);
    return () => clearInterval(timer);
  }, [playing, timeline.length]);

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
      <div className="timeline"><div className="timeline-line" style={{ width: `${(index / (timeline.length - 1)) * 100}%` }} />{timeline.map((item, i) => <button key={`${item.date}-${i}`} className={`tick ${i === index ? 'active' : ''}`} onClick={() => { setPlaying(false); setIndex(i); }}><span className="tick-dot" /><small>{item.date.slice(5)}</small><b>{item.label}</b></button>)}</div>
      <div className="visual-grid"><FloodMap frame={frame} /><aside className="metrics"><div className="metric-kicker">CURRENT OBSERVATION</div><h3>{frame.label}</h3><p>{frame.note}</p><div className="metric"><span>Source raster</span><strong>30<small> m</small></strong><div className="bar"><i style={{ width: '100%' }} /></div></div><div className="metric"><span>Sensor</span><strong>S1</strong><div className="bar warm"><i style={{ width: '100%' }} /></div></div><div className="callout"><ShieldCheck size={17} /><span>Observed NASA OPERA layer. Missing dates remain gaps; no synthetic image is presented as satellite evidence.</span></div></aside></div>
      <div className="data-strip"><div><Database size={16} /><span><b>NASA OPERA</b> · Sentinel-1 DSWx-S1</span></div><span>Source preview · 30 m spatial resolution</span></div>
    </section>
    <footer><span>Built for “Dancing with the SARs”</span><span>NASA data will be credited per product metadata · <a href="https://nisar.jpl.nasa.gov/" target="_blank" rel="noreferrer">mission context</a></span></footer>
  </main>;
}

createRoot(document.getElementById('root')).render(<App />);
