import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { geoMercator, geoPath } from 'd3-geo';
import { ArrowLeftRight, Brain, ChevronRight, Database, Layers3, Map as MapIcon, Maximize2, Minus, Plus, Satellite, ShieldCheck, Waves } from 'lucide-react';
import { frames } from './data';
import { simulations, getSimulation } from './simulations';
import { loadObservations } from './lib/observations';
import './styles.css';
import './raster.css';
import './earth-map.css';
import './dashboard.css';
import './mission.css';
import './pakistan.css';

const tabs = [
  { id: 'explore', label: 'Atlas', icon: MapIcon },
  { id: 'simulations', label: 'Change Signals', icon: Layers3 },
  { id: 'compare', label: 'Compare', icon: ArrowLeftRight },
  { id: 'quiz', label: 'Radar Classroom', icon: Brain }
];

const pakistanHotspots = [
  { id: 'indus-delta', label: 'Indus Delta', detail: 'NISAR scene ready', lon: 67.55, lat: 24.18, kind: 'wetland', status: 'ready' },
  { id: 'lower-sindh', label: 'Lower Sindh floodplain', detail: 'NISAR coverage confirmed', lon: 68.05, lat: 25.72, kind: 'water', status: 'coverage' },
  { id: 'punjab-floodplain', label: 'Punjab floodplain', detail: 'NISAR coverage confirmed', lon: 71.18, lat: 30.07, kind: 'water', status: 'coverage' },
  { id: 'kp-forest', label: 'KP forest corridor', detail: 'NISAR coverage confirmed', lon: 72.35, lat: 35.22, kind: 'forest', status: 'coverage' },
  { id: 'karachi', label: 'Karachi urban water', detail: 'Context scene', lon: 67.01, lat: 24.86, kind: 'urban', status: 'context' }
];

function PakistanAtlas({ selectedId, onSelect }) {
  const [geoJson, setGeoJson] = useState(null);
  useEffect(() => { fetch('/data/pakistan/pakistan-boundary.geo.json').then((response) => response.json()).then(setGeoJson).catch(() => {}); }, []);
  const feature = geoJson?.features?.[0];
  const projection = useMemo(() => feature ? geoMercator().fitSize([800, 560], feature) : null, [feature]);
  const path = useMemo(() => projection ? geoPath(projection) : null, [projection]);
  const selected = pakistanHotspots.find((item) => item.id === selectedId) ?? pakistanHotspots[0];
  const selectedPoint = projection?.([selected.lon, selected.lat]);
  const zoom = selectedPoint ? 1.55 : 1;
  const translate = selectedPoint ? { x: 400 - selectedPoint[0] * zoom, y: 280 - selectedPoint[1] * zoom } : { x: 0, y: 0 };
  return <section className="pakistan-atlas"><div className="atlas-heading"><div><span className="workspace-kicker">PAKISTAN SURFACE ATLAS</span><h3>Choose a place to investigate</h3><p>Click a highlighted area to zoom in. A green marker means a local scene is ready; blue markers have confirmed NISAR coverage queued for the next ingestion pass.</p></div><div className="atlas-status"><span className="ready-dot" /> 1 local scene · 4 coverage-confirmed AOIs</div></div><div className="atlas-map-wrap"><svg className="pakistan-map" viewBox="0 0 800 560" role="img" aria-label="Interactive map of Pakistan with floodplain, wetland, forest, and urban water hotspots"><g className="atlas-zoom" transform={`translate(${translate.x} ${translate.y}) scale(${zoom})`}>{path ? <path className="pakistan-outline" d={path(feature)} /> : <rect className="atlas-loading" x="50" y="100" width="700" height="320" rx="18" />}{pakistanHotspots.map((spot) => { const point = projection?.([spot.lon, spot.lat]); if (!point) return null; const active = spot.id === selected.id; return <g key={spot.id} className={`hotspot ${spot.kind} ${active ? 'active' : ''}`} transform={`translate(${point[0]} ${point[1]})`} role="button" tabIndex="0" aria-label={`${spot.label}: ${spot.detail}`} onClick={() => onSelect(spot.id)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') onSelect(spot.id); }}><circle className="hotspot-halo" r={active ? 16 : 11} /><circle className="hotspot-dot" r={active ? 7 : 5} /><text x="11" y="4">{spot.label}</text></g>; })}</g><text className="map-label-text" x="24" y="34">NISAR / PAKISTAN AOI ATLAS</text><text className="map-label-text map-label-sub" x="24" y="53">L-BAND REPEAT COVERAGE · 2026 MONSOON WINDOW</text></svg><div className="atlas-legend"><span><i className="legend-dot ready" /> scene ready</span><span><i className="legend-dot coverage" /> coverage confirmed</span><span><i className="legend-dot context" /> context only</span></div></div><div className="atlas-selection"><div><span className="workspace-kicker">SELECTED AREA</span><strong>{selected.label}</strong><p>{selected.detail}. {selected.status === 'ready' ? 'Use the Atlas timeline below to compare real NISAR passes.' : 'The area is confirmed in the coverage catalog; its local analysis package is the next ingestion target.'}</p></div><span className={`atlas-badge ${selected.status}`}>{selected.status === 'ready' ? 'OPEN CASE' : selected.status === 'coverage' ? 'COVERAGE FOUND' : 'CONTEXT'}</span></div></section>;
}

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
  const [selectedHotspot, setSelectedHotspot] = useState('indus-delta');
  const timeline = simulation.frames;
  const frame = timeline[index] ?? timeline[0];
  function downloadTimeline() {
    const csv = ['date,label,product,sensor,note', ...timeline.map((item) => [item.date, item.label, item.product, item.sensor, item.note].map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const link = document.createElement('a'); link.href = url; link.download = `${simulation.id}-observations.csv`; link.click(); URL.revokeObjectURL(url);
  }
  return <section className="content-section">
    <div className="section-heading"><div><span className="eyebrow">01 / EXPLORE</span><h2>The observation desk</h2><p>A focused workspace for reading Pakistan radar evidence: context, backscatter, date, and sensor stay visible together.</p></div><div className="cache-pill"><span /> Locally cached · {timeline.length} frames</div></div>
    <PakistanAtlas selectedId={selectedHotspot} onSelect={setSelectedHotspot} /><div className="mission-layout"><aside className="workspace-sidebar"><div className="workspace-kicker">WHAT TO LOOK FOR</div><div className="look-item"><span className="look-icon water">≈</span><div><strong>Water and wetland response</strong><p>Use the flood-mask fallback for water extent; use NISAR GCOV here for structural radar response.</p></div></div><div className="look-item"><span className="look-icon radar">⌁</span><div><strong>L-band repeat signal</strong><p>Compare the same Indus Delta geometry across three NISAR passes.</p></div></div><div className="look-item"><span className="look-icon gap">∥</span><div><strong>Real acquisition gaps</strong><p>Empty time between points is part of the scientific story.</p></div></div><div className="workspace-divider" /><div className="workspace-kicker">LAYER CONTROLS</div><label className="control-row"><span>Radar layer opacity <b>{Math.round(opacity * 100)}%</b></span><input type="range" min="0.2" max="1" step="0.05" value={opacity} onChange={(event) => setOpacity(Number(event.target.value))} /></label><label className="toggle-row"><input type="checkbox" checked={showContext} onChange={(event) => setShowContext(event.target.checked)} /><span>Show map context</span></label><button className="download-button" type="button" onClick={downloadTimeline}><Database size={14} /> Download observation CSV</button><div className="workspace-divider" /><div className="workspace-kicker">CURRENT OBSERVATION</div><strong className="current-title" aria-live="polite">{frame.label}</strong><div className="current-meta">{frame.date} · {frame.product} · {frame.sensor} · {frame.maturity ?? 'OPERA'}</div><button className="text-button" type="button" onClick={() => setTab('compare')}>Open synchronized compare <ChevronRight size={15} /></button></aside><div className="workspace-main"><div className="workspace-map-heading"><span>{simulation.title} · {simulation.subtitle}</span><span className="map-aoi">PAKISTAN · INDUS DELTA AOI</span></div><InteractiveMap frame={frame} layerOpacity={opacity} showContext={showContext} /><Timeline timeline={timeline} index={index} setIndex={setIndex} /><div className="signal-rail"><div className="signal-heading"><span><Satellite size={14} /> Observation ledger</span><span>Evidence over time</span></div><div className="signal-line">{timeline.map((item, itemIndex) => <button type="button" className={itemIndex === index ? 'is-active' : ''} key={`${item.date}-${item.label}`} onClick={() => setIndex(itemIndex)}><i /><span>{item.date.slice(5)}</span><b>{item.sensor}</b></button>)}</div><div className="signal-caption">{frame.note} · {frame.product} · {frame.maturity ?? 'OPERA'} · browse preview</div></div></div></div>
  </section>;
}

function Simulations({ selectedId, setSelectedId, setTab }) {
  const signals = [
    { title: 'Surface water', source: 'OPERA DSWx-S1', status: 'Historical fallback ready', copy: 'A real 30 m radar-derived water mask for disaster timelines.', accent: 'water' },
    { title: 'Mangrove / forest response', source: 'NISAR GCOV', status: 'Indus Delta active', copy: 'Repeat-pass backscatter evidence; not a ground-truth tree-loss claim.', accent: 'forest' },
    { title: 'Thermal / CO₂', source: 'ECOSTRESS + OCO-2/3', status: 'Research extension', copy: 'Real NASA sources reserved for a later validated scene-level module.', accent: 'thermal' }
  ];
  return <section className="content-section"><div className="section-heading"><div><span className="eyebrow">02 / CHANGE SIGNALS</span><h2>Choose evidence, not hype</h2><p>Case files and signal families are separated so the map stays scientifically legible.</p></div><div className="cache-pill"><span /> Offline-ready catalog</div></div><div className="simulation-grid">{simulations.map((simulation) => <button className={`simulation-card ${selectedId === simulation.id ? 'is-selected' : ''}`} type="button" key={simulation.id} onClick={() => { setSelectedId(simulation.id); setTab('explore'); }}><div className={`simulation-swatch ${simulation.accent}`}><Satellite size={22} /></div><div><div className="card-kicker">{simulation.frames.length} LOCAL FRAMES · {simulation.source}</div><h3>{simulation.title}</h3><strong>{simulation.subtitle}</strong><p>{simulation.description}</p><span className="open-case">Open case <ChevronRight size={14} /></span></div></button>)}</div><div className="signal-cards">{signals.map((signal) => <article className={`signal-card ${signal.accent}`} key={signal.title}><div className="signal-card-top"><span>{signal.title}</span><b>{signal.status}</b></div><strong>{signal.source}</strong><p>{signal.copy}</p></article>)}</div><div className="catalog-note"><Database size={16} /><span>Cached data is bundled with this site for instant repeat viewing. Supabase observations can still load when configured.</span></div></section>;
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
  { theme: 'water', question: 'Which conclusion is safest from this before/after water-mask pair?', answer: 'The observed surface-water footprint changed between the two dates.', before: '/data/overlays/brazil-flood-apr21-overlay.png', after: '/data/overlays/brazil-flood-may06-overlay.png', beforeLabel: 'Before · OPERA HLS', afterLabel: 'After · OPERA HLS', options: ['The observed surface-water footprint changed between the two dates.', 'Every nearby building was damaged.', 'The image proves the next flood will be larger.'] },
  { theme: 'radar', question: 'A mangrove edge changes tone between two NISAR views. What should a student say?', answer: 'Radar backscatter changed; the physical driver needs corroboration.', before: '/data/pakistan/indus-delta-nisar-2026-06-19.png', after: '/data/pakistan/indus-delta-nisar-2026-10-17.png', beforeLabel: 'June · NISAR GCOV', afterLabel: 'October · NISAR GCOV', options: ['Radar backscatter changed; the physical driver needs corroboration.', 'The map proves all trees were cut.', 'The brighter pixels are automatically hotter.'] },
  { theme: 'radar', question: 'Why is a repeated NISAR pass useful for the Indus Delta?', answer: 'The same area can be compared at different dates using radar response.', before: '/data/pakistan/indus-delta-nisar-2026-08-18.png', after: '/data/pakistan/indus-delta-nisar-2026-10-17.png', beforeLabel: 'Monsoon · repeat pass', afterLabel: 'Late season · repeat pass', options: ['The same area can be compared at different dates using radar response.', 'It turns radar into an optical photograph.', 'It removes the need for a source or date.'] },
  { theme: 'method', question: 'What does a gap between timeline points mean?', answer: 'There was no included observation at that date.', before: '/data/pakistan/indus-delta-nisar-2026-06-19.png', after: '/data/pakistan/indus-delta-nisar-2026-10-17.png', beforeLabel: 'First valid scene', afterLabel: 'Next selected scene', options: ['There was no included observation at that date.', 'The map failed to load.', 'The flood disappeared and returned every day.'] }
];

function Quiz({ simulation }) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState('');
  const [score, setScore] = useState(0);
  const question = quizQuestions[questionIndex];
  const answered = Boolean(selected);
  function choose(option) { if (answered) return; setSelected(option); if (option === question.answer) setScore((value) => value + 1); }
  function next() { setQuestionIndex((value) => (value + 1) % quizQuestions.length); setSelected(''); }
  return <section className="content-section quiz-section"><div className="section-heading"><div><span className="eyebrow">04 / RADAR CLASSROOM</span><h2>Read the map like a scientist</h2><p>Look at the real before/after scenes, choose the safest interpretation, and learn the do/don’t behind the answer.</p></div><div className="score">{score} / {quizQuestions.length} correct</div></div><div className="quiz-layout"><div className="quiz-number">0{questionIndex + 1}<span>/ 0{quizQuestions.length}</span></div><div className="quiz-body"><div className={`quiz-theme ${question.theme}`}>{question.theme === 'water' ? 'SURFACE WATER' : question.theme === 'radar' ? 'NISAR RADAR' : 'METHOD'}</div><h3>{question.question}</h3><div className="quiz-images"><figure><img src={question.before} alt={question.beforeLabel} /><figcaption>{question.beforeLabel}</figcaption></figure><div className="quiz-arrow">→</div><figure><img src={question.after} alt={question.afterLabel} /><figcaption>{question.afterLabel}</figcaption></figure></div><div className="answer-list">{question.options.map((option) => <button type="button" className={selected ? option === question.answer ? 'correct' : option === selected ? 'incorrect' : '' : ''} onClick={() => choose(option)} key={option}>{option}</button>)}</div>{answered && <div className={`answer-feedback ${selected === question.answer ? 'correct-text' : 'incorrect-text'}`} aria-live="polite"><strong>{selected === question.answer ? 'DO:' : 'LEARN:'}</strong> {selected === question.answer ? question.answer : `The safest reading is: ${question.answer}`}</div>}<button className="primary quiz-next" type="button" onClick={next}>{answered ? 'Next question' : 'Skip question'} <ChevronRight size={15} /></button></div></div></section>;
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
