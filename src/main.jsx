import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowLeftRight, Brain, ChevronRight, Database, Layers3, Map as MapIcon, Maximize2, Minus, Plus, Satellite, ShieldCheck, Waves } from 'lucide-react';
import { frames } from './data';
import { simulations, getSimulation } from './simulations';
import { loadObservations } from './lib/observations';
import './styles.css';
import './raster.css';
import './earth-map.css';
import './dashboard.css';
import './mission.css';

const tabs = [
  { id: 'explore', label: 'Explore', icon: MapIcon },
  { id: 'simulations', label: 'Simulations', icon: Layers3 },
  { id: 'compare', label: 'Compare', icon: ArrowLeftRight },
  { id: 'quiz', label: 'Quiz', icon: Brain }
];

function daysBetween(start, end) {
  return Math.round((new Date(end) - new Date(start)) / 86400000);
}

function InteractiveMap({ frame, compact = false, layerOpacity = 1, showContext = true, sharedView, onViewChange }) {
  const [localView, setLocalView] = useState({ zoom: 1, offset: { x: 0, y: 0 } });
  const [drag, setDrag] = useState(null);
  const view = sharedView ?? localView;

  useEffect(() => { if (!sharedView) setLocalView({ zoom: 1, offset: { x: 0, y: 0 } }); }, [frame.image, sharedView]);
  function updateView(next) { if (onViewChange) onViewChange(next); else setLocalView(next); }
  function onPointerDown(event) { event.currentTarget.setPointerCapture(event.pointerId); setDrag({ x: event.clientX - view.offset.x, y: event.clientY - view.offset.y }); }
  function onPointerMove(event) { if (drag) updateView({ ...view, offset: { x: event.clientX - drag.x, y: event.clientY - drag.y } }); }
  function onWheel(event) { event.preventDefault(); updateView({ ...view, zoom: Math.min(2.6, Math.max(1, view.zoom + (event.deltaY < 0 ? 0.12 : -0.12))) }); }
  function resetView() { updateView({ zoom: 1, offset: { x: 0, y: 0 } }); }

  return <div className={`interactive-map ${compact ? 'compact-map' : ''}`} role="img" aria-label={`${frame.label} ${frame.layerLabel ?? 'surface-water extent'} from ${frame.sensor} ${frame.product}`} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={() => setDrag(null)} onPointerCancel={() => setDrag(null)} onWheel={onWheel}>
    <div className="map-viewport" style={{ transform: `translate(${view.offset.x}px, ${view.offset.y}px) scale(${view.zoom})` }}>
      <img className="map-context" src={frame.texture} alt="" draggable="false" style={{ opacity: showContext ? undefined : 0 }} />
      <img className="raster" src={frame.image} alt="" draggable="false" style={{ opacity: layerOpacity }} />
    </div>
    <div className="map-vignette" />
    <div className="map-tools" aria-label="Map controls">
      <button type="button" aria-label="Zoom in" onPointerDown={(event) => event.stopPropagation()} onClick={() => setZoom((value) => Math.min(2.6, value + 0.2))}><Plus size={15} /></button>
      <button type="button" aria-label="Zoom out" onPointerDown={(event) => event.stopPropagation()} onClick={() => setZoom((value) => Math.max(1, value - 0.2))}><Minus size={14} /></button>
      <button type="button" aria-label="Reset map view" onPointerDown={(event) => event.stopPropagation()} onClick={resetView}><Maximize2 size={14} /></button>
    </div>
    <div className="map-label"><span className="legend-dot flood-dot" /> {frame.layerLabel ?? 'detected surface water'}</div>
    <div className="map-coordinates">DRAG TO PAN · SCROLL TO ZOOM</div>
  </div>;
}

function Timeline({ timeline, index, setIndex }) {
  const frame = timeline[index] ?? timeline[0];
  if (!frame) return null;
  return <div className="timeline-wrap">
    <div className="timeline-top"><span>Observation timeline</span><strong>{frame.date} · {frame.label}</strong></div>
    <input className="timeline-range" type="range" min="0" max={Math.max(timeline.length - 1, 0)} value={index} onChange={(event) => setIndex(Number(event.target.value))} aria-label="Select observation date" />
    <div className="timeline-ticks">{timeline.map((item, itemIndex) => <button type="button" className={itemIndex === index ? 'is-active' : ''} key={`${item.date}-${item.label}`} onClick={() => setIndex(itemIndex)}><span />{item.date.slice(5)}</button>)}</div>
    <div className="timeline-note">{timeline.length} cached observations · {daysBetween(timeline[0].date, timeline[timeline.length - 1].date)} calendar days · gaps are real acquisition gaps</div>
  </div>;
}

function Explore({ simulation, setTab }) {
  const [index, setIndex] = useState(0);
  const [opacity, setOpacity] = useState(0.9);
  const [showContext, setShowContext] = useState(true);
  const timeline = simulation.frames;
  const frame = timeline[index] ?? timeline[0];
  function downloadTimeline() {
    const csv = ['date,label,product,sensor,note', ...timeline.map((item) => [item.date, item.label, item.product, item.sensor, item.note].map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const link = document.createElement('a'); link.href = url; link.download = `${simulation.id}-observations.csv`; link.click(); URL.revokeObjectURL(url);
  }
  return <section className="content-section">
    <div className="section-heading"><div><span className="eyebrow">01 / EXPLORE</span><h2>The observation desk</h2><p>A focused workspace for reading Pakistan radar evidence: context, backscatter, date, and sensor stay visible together.</p></div><div className="cache-pill"><span /> Locally cached · {timeline.length} frames</div></div>
    <div className="mission-layout"><aside className="workspace-sidebar"><div className="workspace-kicker">WHAT TO LOOK FOR</div><div className="look-item"><span className="look-icon water">≈</span><div><strong>Water and wetland response</strong><p>Use the flood-mask fallback for water extent; use NISAR GCOV here for structural radar response.</p></div></div><div className="look-item"><span className="look-icon radar">⌁</span><div><strong>L-band repeat signal</strong><p>Compare the same Indus Delta geometry across three NISAR passes.</p></div></div><div className="look-item"><span className="look-icon gap">∥</span><div><strong>Real acquisition gaps</strong><p>Empty time between points is part of the scientific story.</p></div></div><div className="workspace-divider" /><div className="workspace-kicker">LAYER CONTROLS</div><label className="control-row"><span>Radar layer opacity <b>{Math.round(opacity * 100)}%</b></span><input type="range" min="0.2" max="1" step="0.05" value={opacity} onChange={(event) => setOpacity(Number(event.target.value))} /></label><label className="toggle-row"><input type="checkbox" checked={showContext} onChange={(event) => setShowContext(event.target.checked)} /><span>Show map context</span></label><button className="download-button" type="button" onClick={downloadTimeline}><Database size={14} /> Download observation CSV</button><div className="workspace-divider" /><div className="workspace-kicker">CURRENT OBSERVATION</div><strong className="current-title" aria-live="polite">{frame.label}</strong><div className="current-meta">{frame.date} · {frame.product} · {frame.sensor} · {frame.maturity ?? 'OPERA'}</div><button className="text-button" type="button" onClick={() => setTab('compare')}>Open synchronized compare <ChevronRight size={15} /></button></aside><div className="workspace-main"><div className="workspace-map-heading"><span>{simulation.title} · {simulation.subtitle}</span><span className="map-aoi">PAKISTAN · INDUS DELTA AOI</span></div><InteractiveMap frame={frame} layerOpacity={opacity} showContext={showContext} /><Timeline timeline={timeline} index={index} setIndex={setIndex} /><div className="signal-rail"><div className="signal-heading"><span><Satellite size={14} /> Observation ledger</span><span>Evidence over time</span></div><div className="signal-line">{timeline.map((item, itemIndex) => <button type="button" className={itemIndex === index ? 'is-active' : ''} key={`${item.date}-${item.label}`} onClick={() => setIndex(itemIndex)}><i /><span>{item.date.slice(5)}</span><b>{item.sensor}</b></button>)}</div><div className="signal-caption">{frame.note} · {frame.product} · {frame.maturity ?? 'OPERA'} · browse preview</div></div></div></div>
  </section>;
}

function Simulations({ selectedId, setSelectedId, setTab }) {
  return <section className="content-section"><div className="section-heading"><div><span className="eyebrow">02 / SIMULATIONS</span><h2>Choose a cached case file</h2><p>These are locally stored views of the same event, each using a different observation mix.</p></div><div className="cache-pill"><span /> Offline-ready catalog</div></div><div className="simulation-grid">{simulations.map((simulation) => <button className={`simulation-card ${selectedId === simulation.id ? 'is-selected' : ''}`} type="button" key={simulation.id} onClick={() => { setSelectedId(simulation.id); setTab('explore'); }}><div className={`simulation-swatch ${simulation.accent}`}><Satellite size={22} /></div><div><div className="card-kicker">{simulation.frames.length} LOCAL FRAMES · {simulation.source}</div><h3>{simulation.title}</h3><strong>{simulation.subtitle}</strong><p>{simulation.description}</p><span className="open-case">Open case <ChevronRight size={14} /></span></div></button>)}</div><div className="catalog-note"><Database size={16} /><span>Cached data is bundled with this site for instant repeat viewing. Supabase observations can still load when configured.</span></div></section>;
}

function FramePicker({ frames: availableFrames, value, onChange, label }) {
  return <label className="field-label">{label}<select className="field-select" value={value} onChange={(event) => onChange(Number(event.target.value))}>{availableFrames.map((item, index) => <option value={index} key={`${item.date}-${item.label}`}>{item.date} · {item.label}</option>)}</select></label>;
}

function Compare({ simulation }) {
  const timeline = simulation.frames;
  const [leftIndex, setLeftIndex] = useState(0);
  const [rightIndex, setRightIndex] = useState(Math.max(timeline.length - 1, 0));
  const [sharedView, setSharedView] = useState({ zoom: 1, offset: { x: 0, y: 0 } });
  const left = timeline[leftIndex] ?? timeline[0];
  const right = timeline[rightIndex] ?? timeline[0];
  return <section className="content-section"><div className="section-heading"><div><span className="eyebrow">03 / COMPARE</span><h2>Two dates. One synchronized view.</h2><p>Both maps share pan and zoom, so the same riverbanks and flood channels stay aligned while you move through time.</p></div><div className="compare-span"><ArrowLeftRight size={16} /> {daysBetween(left.date, right.date)} days apart</div></div><div className="compare-controls"><FramePicker label="Earlier observation" frames={timeline} value={leftIndex} onChange={setLeftIndex} /><FramePicker label="Later observation" frames={timeline} value={rightIndex} onChange={setRightIndex} /></div><div className="sync-banner"><ArrowLeftRight size={15} /> Synchronized dual view · drag or zoom either map</div><div className="compare-grid"><div className="compare-panel"><div className="compare-title"><span>EARLIER · {left.date}</span><strong>{left.label}</strong></div><InteractiveMap frame={left} compact sharedView={sharedView} onViewChange={setSharedView} /><p>{left.product} · {left.sensor}</p></div><div className="compare-panel"><div className="compare-title"><span>LATER · {right.date}</span><strong>{right.label}</strong></div><InteractiveMap frame={right} compact sharedView={sharedView} onViewChange={setSharedView} /><p>{right.product} · {right.sensor}</p></div></div><div className="compare-foot"><span><i className="legend-square earlier" /> Earlier observation</span><span><i className="legend-square later" /> Later observation</span><span>Same AOI · {simulation.title}</span></div></section>;
}

const quizQuestions = [
  { question: 'Why can Sentinel-1 help during cloudy flood conditions?', answer: 'Radar can acquire day or night and through cloud cover.', options: ['Radar can acquire day or night and through cloud cover.', 'Radar only works when the Sun is overhead.', 'Radar measures air temperature instead of surface response.'] },
  { question: 'What does the purple layer represent?', answer: 'Detected surface water in the OPERA layer.', options: ['Detected surface water in the OPERA layer.', 'A population-density estimate.', 'A prediction of next month’s rainfall.'] },
  { question: 'What does a gap between timeline points mean?', answer: 'There was no included observation at that date.', options: ['There was no included observation at that date.', 'The map failed to load.', 'The flood disappeared and returned every day.'] },
  { question: 'Which product is used for radar confirmation?', answer: 'OPERA DSWx-S1.', options: ['OPERA DSWx-S1.', 'MODIS Land Surface Temperature.', 'A synthetic training image.'] }
];

function Quiz({ simulation }) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState('');
  const [score, setScore] = useState(0);
  const question = quizQuestions[questionIndex];
  const answered = Boolean(selected);
  function choose(option) { if (answered) return; setSelected(option); if (option === question.answer) setScore((value) => value + 1); }
  function next() { setQuestionIndex((value) => (value + 1) % quizQuestions.length); setSelected(''); }
  return <section className="content-section quiz-section"><div className="section-heading"><div><span className="eyebrow">04 / QUIZ</span><h2>Read the map like a scientist</h2><p>Use the active case file, {simulation.title}, to test your understanding of radar and surface-water observations.</p></div><div className="score">{score} / {quizQuestions.length} correct</div></div><div className="quiz-layout"><div className="quiz-number">0{questionIndex + 1}<span>/ 0{quizQuestions.length}</span></div><div className="quiz-body"><h3>{question.question}</h3><div className="answer-list">{question.options.map((option) => <button type="button" className={selected ? option === question.answer ? 'correct' : option === selected ? 'incorrect' : '' : ''} onClick={() => choose(option)} key={option}>{option}</button>)}</div>{answered && <div className={`answer-feedback ${selected === question.answer ? 'correct-text' : 'incorrect-text'}`} aria-live="polite">{selected === question.answer ? 'Correct.' : `Not quite. ${question.answer}`}</div>}<button className="primary quiz-next" type="button" onClick={next}>{answered ? 'Next question' : 'Skip question'} <ChevronRight size={15} /></button></div></div></section>;
}

function App() {
  const [tab, setTab] = useState('explore');
  const [selectedId, setSelectedId] = useState(() => localStorage.getItem('sars-selected-simulation') || 'indus-delta-nisar');
  const [remoteFrames, setRemoteFrames] = useState(frames);
  const simulation = useMemo(() => getSimulation(selectedId), [selectedId]);
  useEffect(() => { localStorage.setItem('sars-selected-simulation', selectedId); }, [selectedId]);
  useEffect(() => { loadObservations('brazil-flood-2024').then((result) => { if (result.source === 'supabase' && result.frames.length) setRemoteFrames(result.frames); }).catch(() => {}); }, []);
  return <main className="app-shell">
    <nav className="app-nav"><div className="brand"><Waves size={20} /> DANCING WITH THE SARs</div><div className="nav-meta">NASA SPACE APPS <span>·</span> FLOOD PULSE</div></nav>
    <header className="site-header"><div><span className="eyebrow">PAKISTAN / SURFACE PULSE</span><h1>Read the Indus<br /><em>through radar.</em></h1><p>Explore repeat-pass NISAR observations across Pakistan’s floodplains, wetlands, and forest edges. Compare dates, inspect the map, and learn what the signal can—and cannot—tell us.</p></div><div className="header-context"><div className="context-label">ACTIVE CASE FILE</div><strong>{simulation.title}</strong><span>{simulation.subtitle}</span><small><span className="pulse" /> Cached locally · {simulation.frames.length} observations{remoteFrames.length !== frames.length ? ' · live catalog available' : ''}</small></div></header>
    <div className="tab-shell"><div className="tab-list" role="tablist" aria-label="Flood dashboard sections">{tabs.map(({ id, label, icon: Icon }) => <button id={`${id}-tab`} className={`tab-button ${tab === id ? 'is-active' : ''}`} role="tab" aria-selected={tab === id} aria-controls={`${id}-panel`} type="button" key={id} onClick={() => setTab(id)}><Icon size={16} />{label}</button>)}</div><div className="tab-rule" /></div>
    <div className="tab-content"><div id="explore-panel" role="tabpanel" aria-labelledby="explore-tab" hidden={tab !== 'explore'}>{tab === 'explore' && <Explore simulation={simulation} setTab={setTab} />}</div><div id="simulations-panel" role="tabpanel" aria-labelledby="simulations-tab" hidden={tab !== 'simulations'}>{tab === 'simulations' && <Simulations selectedId={selectedId} setSelectedId={setSelectedId} setTab={setTab} />}</div><div id="compare-panel" role="tabpanel" aria-labelledby="compare-tab" hidden={tab !== 'compare'}>{tab === 'compare' && <Compare simulation={simulation} />}</div><div id="quiz-panel" role="tabpanel" aria-labelledby="quiz-tab" hidden={tab !== 'quiz'}>{tab === 'quiz' && <Quiz simulation={simulation} />}</div></div>
    <footer><span>Built for “Dancing with the SARs”</span><span><Database size={13} /> NASA NISAR + OPERA · local catalog · <a href="https://nisar.jpl.nasa.gov/" target="_blank" rel="noreferrer">mission context</a></span></footer>
  </main>;
}

createRoot(document.getElementById('root')).render(<App />);
