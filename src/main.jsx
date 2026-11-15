import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { geoMercator, geoPath } from 'd3-geo';
import { ArrowLeftRight, Brain, ChevronRight, Database, Globe2, Layers3, Map as MapIcon, Maximize2, Minus, Plus, Satellite, ShieldCheck, Waves } from 'lucide-react';
import { brazilFrames, frames, pakistanFireFrames, pakistanThermalFrames, pakistanVegetationFrames, pakistanWaterFrames } from './data';
import { simulations, getSimulation } from './simulations';
import { loadObservations } from './lib/observations';
import JapanBrazilAtlas from './JapanBrazilAtlas';
import GlobeSection from './GlobeSection';
import SourcesSection from './SourcesSection';
import './styles.css';
import './raster.css';
import './earth-map.css';
import './dashboard.css';
import './mission.css';
import './pakistan.css';
import './revamp.css';
import './ops-desk.css';

const tabs = [
  { id: 'explore', label: 'Atlas', icon: MapIcon },
  { id: 'globe', label: '3D Globe', icon: Globe2 },
  { id: 'sources', label: 'Live Sources', icon: Database },
  { id: 'simulations', label: 'Change Signals', icon: Layers3 },
  { id: 'compare', label: 'Compare', icon: ArrowLeftRight },
  { id: 'quiz', label: 'Radar Classroom', icon: Brain }
];

const pakistanHotspots = [
  { id: 'indus-delta', label: 'Indus Delta', detail: 'NISAR scene ready', lon: 67.55, lat: 24.18, kind: 'wetland', status: 'ready', granules: 106, dates: 42, story: 'Tidal water, wetlands, and mangrove structure' },
  { id: 'lower-sindh', label: 'Lower Sindh floodplain', detail: 'NISAR coverage confirmed', lon: 68.05, lat: 25.72, kind: 'water', status: 'coverage', granules: 156, dates: 53, story: 'Monsoon floodplain and river-channel response' },
  { id: 'punjab-floodplain', label: 'Punjab floodplain', detail: 'NISAR coverage confirmed', lon: 71.18, lat: 30.07, kind: 'water', status: 'coverage', granules: 94, dates: 39, story: 'Seasonal inundation and agricultural water stress' },
  { id: 'kp-forest', label: 'KP forest corridor', detail: 'NISAR coverage confirmed', lon: 72.35, lat: 35.22, kind: 'forest', status: 'coverage', granules: 128, dates: 42, story: 'Forest-edge structure and disturbance screening' },
  { id: 'karachi', label: 'Karachi urban water', detail: 'Context scene', lon: 67.01, lat: 24.86, kind: 'urban', status: 'context', granules: 0, dates: 0, story: 'Urban drainage, coast, and heat-risk context' }
];

function PakistanAtlas({ selectedId, onSelect }) {
  const [geoJson, setGeoJson] = useState(null);
  const [focusedId, setFocusedId] = useState(null);
  useEffect(() => { fetch('/data/pakistan/pakistan-boundary.geo.json').then((response) => response.json()).then(setGeoJson).catch(() => {}); }, []);
  const feature = geoJson?.features?.[0];
  const projection = useMemo(() => feature ? geoMercator().fitSize([800, 560], feature) : null, [feature]);
  const path = useMemo(() => projection ? geoPath(projection) : null, [projection]);
  const selected = pakistanHotspots.find((item) => item.id === selectedId) ?? pakistanHotspots[0];
  const selectedPoint = projection?.([selected.lon, selected.lat]);
  const isFocused = selectedPoint && focusedId === selected.id;
  const zoom = isFocused ? 1.55 : 1;
  const translate = isFocused ? { x: 400 - selectedPoint[0] * zoom, y: 280 - selectedPoint[1] * zoom } : { x: 0, y: 0 };
  return <section className="pakistan-atlas"><div className="atlas-heading"><div><span className="workspace-kicker">PAKISTAN SURFACE ATLAS</span><h3>Choose a place to investigate</h3><p>Click a highlighted area to zoom in. A green marker means a local scene is ready; blue markers have confirmed NISAR coverage queued for the next ingestion pass.</p></div><div className="atlas-status"><span className="ready-dot" /> 1 local scene · 4 coverage-confirmed AOIs</div></div><div className="atlas-map-wrap"><svg className="pakistan-map" viewBox="0 0 800 560" role="img" aria-label="Interactive map of Pakistan with floodplain, wetland, forest, and urban water hotspots"><g className="atlas-zoom" transform={`translate(${translate.x} ${translate.y}) scale(${zoom})`}>{path ? <path className="pakistan-outline" d={path(feature)} /> : <rect className="atlas-loading" x="50" y="100" width="700" height="320" rx="18" />}{pakistanHotspots.map((spot) => { const point = projection?.([spot.lon, spot.lat]); if (!point) return null; const active = spot.id === selected.id; return <g key={spot.id} className={`hotspot ${spot.kind} ${active ? 'active' : ''}`} transform={`translate(${point[0]} ${point[1]})`} role="button" tabIndex="0" aria-label={`${spot.label}: ${spot.detail}`} onClick={() => { setFocusedId(spot.id); onSelect(spot.id); }} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { setFocusedId(spot.id); onSelect(spot.id); } }}><circle className="hotspot-halo" r={active ? 16 : 11} /><circle className="hotspot-dot" r={active ? 7 : 5} /><text x="11" y="4">{spot.label}</text></g>; })}</g><text className="map-label-text" x="24" y="34">NISAR / PAKISTAN AOI ATLAS</text><text className="map-label-text map-label-sub" x="24" y="53">L-BAND REPEAT COVERAGE · 2026 MONSOON WINDOW</text></svg><div className="atlas-legend"><span><i className="legend-dot ready" /> scene ready</span><span><i className="legend-dot coverage" /> coverage confirmed</span><span><i className="legend-dot context" /> context only</span></div></div><div className="atlas-selection"><div><span className="workspace-kicker">SELECTED AREA</span><strong>{selected.label}</strong><p>{selected.detail}. {selected.status === 'ready' ? 'A local evidence package is ready; use the active case timeline below.' : 'The area is confirmed in the coverage catalog; its local analysis package is the next ingestion target.'}</p></div><span className={`atlas-badge ${selected.status}`}>{selected.status === 'ready' ? 'OPEN CASE' : selected.status === 'coverage' ? 'COVERAGE FOUND' : 'CONTEXT'}</span></div></section>;
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
      <button type="button" aria-label="Zoom in" onPointerDown={(event) => event.stopPropagation()} onClick={() => updateView({ ...view, zoom: Math.min(2.6, view.zoom + 0.2) })}><Plus size={15} /></button>
      <button type="button" aria-label="Zoom out" onPointerDown={(event) => event.stopPropagation()} onClick={() => updateView({ ...view, zoom: Math.max(1, view.zoom - 0.2) })}><Minus size={14} /></button>
      <button type="button" aria-label="Reset map view" onPointerDown={(event) => event.stopPropagation()} onClick={resetView}><Maximize2 size={14} /></button>
    </div>
    <div className="map-label"><span className="legend-dot flood-dot" /> {frame.layerLabel ?? 'detected surface water'}</div>
    <div className="map-coordinates">DRAG TO PAN · SCROLL TO ZOOM</div>
  </div>;
}

function CoveragePanel({ spot }) {
  const hasCoverage = spot.status === 'coverage';
  return <div className="coverage-panel">
    <div className="coverage-image">
      <img src="/data/pakistan/pakistan-context-2026-10-17.jpg" alt="NASA MODIS context image covering Pakistan" />
      <div className="coverage-image-wash" />
      <div className="coverage-pins"><span className={`coverage-pin ${spot.kind}`} /><span className="coverage-pin-label">{spot.label}</span></div>
      <span className="coverage-source">NASA MODIS · 17 OCT 2026 · CONTEXT ONLY</span>
    </div>
    <div className="coverage-copy">
      <span className={`coverage-state-label ${hasCoverage ? 'confirmed' : 'context'}`}>{hasCoverage ? 'NISAR COVERAGE CONFIRMED' : 'CONTEXT-ONLY LOCATION'}</span>
      <h3>{spot.label}</h3>
      <p>{spot.story}. This location is selected on the national atlas, but its analysis raster is not bundled into this build yet. The dashboard keeps that boundary visible instead of showing another area’s image.</p>
      <div className="coverage-stats">
        <div><strong>{hasCoverage ? spot.granules : '—'}</strong><span>CMR granules</span></div>
        <div><strong>{hasCoverage ? spot.dates : '—'}</strong><span>acquisition dates</span></div>
        <div><strong>2026</strong><span>audit window</span></div>
      </div>
      <div className="coverage-next"><ShieldCheck size={16} /><span><b>Next analysis step</b> Download the matching GCOV/DSWx asset, process the same AOI, then it appears as a local timeline case.</span></div>
    </div>
  </div>;
}

function Timeline({ timeline, index, setIndex }) {
  const frame = timeline[index] ?? timeline[0];
  if (!frame) return null;
  return <div className="timeline-wrap">
    <div className="timeline-top"><span>Observation timeline</span><strong>{frame.date} · {frame.label}</strong></div>
    <input className="timeline-range" type="range" min="0" max={Math.max(timeline.length - 1, 0)} value={index} onChange={(event) => setIndex(Number(event.target.value))} aria-label="Select observation date" />
    <div className="timeline-ticks">{timeline.map((item, itemIndex) => <button type="button" className={itemIndex === index ? 'is-active' : ''} key={`${item.date}-${item.label}`} onClick={() => setIndex(itemIndex)}><span />{item.date.slice(2)}</button>)}</div>
    <div className="timeline-note">{timeline.length} cached observations · {daysBetween(timeline[0].date, timeline[timeline.length - 1].date)} calendar days · gaps are real acquisition gaps</div>
  </div>;
}

function FrameGallery({ timeline, index, setIndex }) {
  return <div className="frame-gallery" aria-label="Available evidence frames">
    <div className="frame-gallery-heading"><span>AVAILABLE PASSES</span><strong>{index + 1} / {timeline.length} selected</strong></div>
    <div className="frame-gallery-track">{timeline.map((item, itemIndex) => <button type="button" className={`frame-card ${itemIndex === index ? 'is-active' : ''}`} key={`${item.date}-${item.label}`} onClick={() => setIndex(itemIndex)}><img src={item.image} alt="" /><span className="frame-card-shade" /><span className="frame-card-copy"><b>{item.date}</b><strong>{item.label}</strong><small>{item.sensor} · {item.product}</small></span></button>)}</div>
  </div>;
}

function Explore({ simulation, setTab }) {
  const [index, setIndex] = useState(0);
  const [opacity, setOpacity] = useState(0.68);
  const [showContext, setShowContext] = useState(true);
  const [selectedHotspot, setSelectedHotspot] = useState('indus-delta');
  const timeline = simulation.frames;
  const frame = timeline[index] ?? timeline[0];
  const selectedSpot = pakistanHotspots.find((item) => item.id === selectedHotspot) ?? pakistanHotspots[0];
  const hasLocalScene = selectedSpot.status === 'ready';
  function downloadTimeline() {
    const csv = ['date,label,product,sensor,note', ...timeline.map((item) => [item.date, item.label, item.product, item.sensor, item.note].map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const link = document.createElement('a'); link.href = url; link.download = `${simulation.id}-observations.csv`; link.click(); URL.revokeObjectURL(url);
  }
  return <section className="content-section">
    <div className="section-heading"><div><span className="eyebrow">01 / EXPLORE</span><h2>The observation desk</h2><p>Start with Pakistan, select a place, then inspect the exact evidence available for that location.</p></div><div className="cache-pill"><span /> Locally cached · {hasLocalScene ? `${timeline.length} frames` : 'coverage audit'}</div></div>
    <PakistanAtlas selectedId={selectedHotspot} onSelect={(id) => { setSelectedHotspot(id); setIndex(0); }} />
    <div className="mission-layout"><aside className="workspace-sidebar"><div className="workspace-kicker">SELECTED INVESTIGATION</div><div className="selected-investigation"><span className={`investigation-dot ${selectedSpot.kind}`} /><div><strong>{selectedSpot.label}</strong><small>{selectedSpot.story}</small></div></div><div className="workspace-divider" /><div className="workspace-kicker">WHAT TO LOOK FOR</div><div className="look-item"><span className="look-icon water">≈</span><div><strong>Surface-water footprint</strong><p>Use OPERA DSWx-S1 for mapped water extent; it is separate from the NISAR backscatter preview.</p></div></div><div className="look-item"><span className="look-icon radar">⌁</span><div><strong>Radar structure</strong><p>Repeat-pass L-band response can reveal changes in moisture, roughness, and vegetation structure.</p></div></div><div className="look-item"><span className="look-icon gap">∥</span><div><strong>Coverage gaps</strong><p>Missing dates remain visible. No interpolation is presented as an observation.</p></div></div><div className="workspace-divider" /><div className="workspace-kicker">LAYER CONTROLS</div><label className="control-row"><span>Evidence layer opacity <b>{Math.round(opacity * 100)}%</b></span><input type="range" min="0.2" max="1" step="0.05" value={opacity} onChange={(event) => setOpacity(Number(event.target.value))} /></label><label className="toggle-row"><input type="checkbox" checked={showContext} onChange={(event) => setShowContext(event.target.checked)} /><span>Show map context</span></label>{hasLocalScene && <><button className="download-button" type="button" onClick={downloadTimeline}><Database size={14} /> Download observation CSV</button><button className="text-button" type="button" onClick={() => setTab('compare')}>Open synchronized compare <ChevronRight size={15} /></button></>}</aside><div className="workspace-main"><div className="workspace-map-heading"><span><b>{selectedSpot.label}</b> · {hasLocalScene ? `${simulation.title} · ${simulation.subtitle}` : 'coverage evidence'}</span><span className="map-aoi">{hasLocalScene ? 'LOCAL SCENE' : selectedSpot.detail.toUpperCase()}</span></div>{hasLocalScene ? <><InteractiveMap frame={frame} layerOpacity={opacity} showContext={showContext} /><FrameGallery timeline={timeline} index={index} setIndex={setIndex} /><Timeline timeline={timeline} index={index} setIndex={setIndex} /><div className="signal-rail"><div className="signal-heading"><span><Satellite size={14} /> Observation ledger</span><span>{timeline.length} real passes</span></div><div className="signal-line">{timeline.map((item, itemIndex) => <button type="button" className={itemIndex === index ? 'is-active' : ''} key={`${item.date}-${item.label}`} onClick={() => setIndex(itemIndex)}><i /><span>{item.date.slice(2)}</span><b>{item.sensor}</b></button>)}</div><div className="signal-caption">{frame.note} · {frame.product} · {frame.maturity ?? 'OPERA'} · {simulation.source}</div></div></> : <CoveragePanel spot={selectedSpot} />}</div></div>
  </section>;
}

function Simulations({ selectedId, setSelectedId, setTab }) {
  const signals = [
    { title: 'Surface water', source: 'OPERA DSWx-S1', status: 'Pakistan scenes cached', copy: 'Real Sentinel-1-derived water-mask browse previews with date-controlled repeat passes.', accent: 'water' },
    { title: 'Vegetation / mangroves', source: 'NISAR GCOV + MODIS NDVI', status: 'Pakistan timelines active', copy: 'Radar structure plus seasonal vegetation context; no automatic tree-loss claim.', accent: 'forest' },
    { title: 'Heat / thermal anomalies', source: 'MODIS LST + VIIRS', status: 'Pakistan scenes cached', copy: 'Real NASA thermal layers for heat context and anomaly screening, not building-level attribution.', accent: 'thermal' }
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
  { theme: 'water', question: 'Which conclusion is safest from this before/after water-mask pair?', answer: 'The observed surface-water footprint changed between the two dates.', before: pakistanWaterFrames[4].image, after: pakistanWaterFrames[5].image, beforeLabel: '03 Jun · OPERA DSWx-S1', afterLabel: '14 Sep · OPERA DSWx-S1', options: ['The observed surface-water footprint changed between the two dates.', 'Every nearby building was damaged.', 'The image proves the next flood will be larger.'] },
  { theme: 'forest', question: 'What is the safest way to read this vegetation comparison?', answer: 'The vegetation index differs; crop cycle, moisture, and land cover need context.', before: pakistanVegetationFrames[0].image, after: pakistanVegetationFrames[2].image, beforeLabel: '19 Jun · MODIS NDVI', afterLabel: '17 Oct · MODIS NDVI', options: ['The vegetation index differs; crop cycle, moisture, and land cover need context.', 'Every green pixel is a forest and every brown pixel is deforestation.', 'The map alone proves trees were cut.'] },
  { theme: 'thermal', question: 'What does this land-surface-temperature pair show?', answer: 'A regional daytime thermal pattern that should be interpreted with clouds, season, and land cover.', before: pakistanThermalFrames[0].image, after: pakistanThermalFrames[2].image, beforeLabel: '06 Jun · MODIS LST', afterLabel: '17 Oct · MODIS LST', options: ['A regional daytime thermal pattern that should be interpreted with clouds, season, and land cover.', 'The temperature of every building roof.', 'A direct measurement of CO₂ emissions from each city.'] },
  { theme: 'fire', question: 'How should the red VIIRS points be described?', answer: 'They are thermal-anomaly detections that require confirmation before being called a fire perimeter.', before: pakistanFireFrames[0].image, after: pakistanFireFrames[1].image, beforeLabel: '18 Aug · VIIRS', afterLabel: '17 Oct · VIIRS', options: ['They are thermal-anomaly detections that require confirmation before being called a fire perimeter.', 'They are a complete map of all active fires.', 'They show flood depth.'] },
  { theme: 'radar', question: 'Why is a repeated NISAR pass useful for the Indus Delta?', answer: 'The same area can be compared at different dates using radar response.', before: '/data/pakistan/indus-delta-nisar-2026-06-19.png', after: '/data/pakistan/indus-delta-nisar-2026-10-17.png', beforeLabel: '19 Jun · NISAR GCOV', afterLabel: '17 Oct · NISAR GCOV', options: ['The same area can be compared at different dates using radar response.', 'It turns radar into an optical photograph.', 'It removes the need for a source or date.'] },
  { theme: 'method', question: 'What does a gap between timeline points mean?', answer: 'There was no included observation at that date.', before: '/data/pakistan/pakistan-context-2026-06-19.jpg', after: '/data/pakistan/pakistan-context-2026-10-17.jpg', beforeLabel: '19 Jun · MODIS context', afterLabel: '17 Oct · MODIS context', options: ['There was no included observation at that date.', 'The map failed to load.', 'The flood disappeared and returned every day.'] }
];

function Quiz({ simulation }) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState('');
  const [score, setScore] = useState(0);
  const question = quizQuestions[questionIndex];
  const answered = Boolean(selected);
  function choose(option) { if (answered) return; setSelected(option); if (option === question.answer) setScore((value) => value + 1); }
  function next() { setQuestionIndex((value) => (value + 1) % quizQuestions.length); setSelected(''); }
  return <section className="content-section quiz-section"><div className="section-heading"><div><span className="eyebrow">04 / RADAR CLASSROOM</span><h2>Read the map like a scientist</h2><p>Every question now has its own real before/after evidence layer, with feedback that teaches the limit of the signal.</p></div><div className="score">{score} / {quizQuestions.length} correct</div></div><div className="quiz-layout"><div className="quiz-number">0{questionIndex + 1}<span>/ 0{quizQuestions.length}</span></div><div className="quiz-body"><div className={`quiz-theme ${question.theme}`}>{question.theme === 'water' ? 'SURFACE WATER' : question.theme === 'forest' ? 'VEGETATION / FOREST CONTEXT' : question.theme === 'thermal' ? 'LAND-SURFACE TEMPERATURE' : question.theme === 'fire' ? 'THERMAL ANOMALIES' : question.theme === 'radar' ? 'NISAR RADAR' : 'METHOD'}</div><h3>{question.question}</h3><div className="quiz-images"><figure><img src={question.before} alt={question.beforeLabel} /><figcaption>{question.beforeLabel}</figcaption></figure><div className="quiz-arrow">→</div><figure><img src={question.after} alt={question.afterLabel} /><figcaption>{question.afterLabel}</figcaption></figure></div><div className="answer-list">{question.options.map((option) => <button type="button" className={selected ? option === question.answer ? 'correct' : option === selected ? 'incorrect' : '' : ''} onClick={() => choose(option)} key={option}>{option}</button>)}</div>{answered && <div className={`answer-feedback ${selected === question.answer ? 'correct-text' : 'incorrect-text'}`} aria-live="polite"><strong>{selected === question.answer ? 'DO:' : 'LEARN:'}</strong> {selected === question.answer ? question.answer : `The safest reading is: ${question.answer}`}</div>}<button className="primary quiz-next" type="button" onClick={next}>{answered ? 'Next question' : 'Skip question'} <ChevronRight size={15} /></button></div></div></section>;
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
    <header className="site-header"><div><span className="eyebrow">SURFACE PULSE</span><h1>Read change<br /><em>through radar.</em></h1><p>Japan and Brazil atlas demos, a 3D globe, and live ASF/Earthdata sources—kept separate from illustrative overlays so the signal stays honest.</p></div><div className="header-context"><div className="context-label">ACTIVE CASE FILE</div><strong>{simulation.title}</strong><span>{simulation.subtitle}</span><small><span className="pulse" /> Cached · {simulation.frames.length} observations{remoteFrames.length !== frames.length ? ' · live catalog' : ''}</small></div></header>
    <div className="tab-shell"><div className="tab-list" role="tablist" aria-label="Flood dashboard sections">{tabs.map(({ id, label, icon: Icon }) => <button id={`${id}-tab`} className={`tab-button ${tab === id ? 'is-active' : ''}`} role="tab" aria-selected={tab === id} aria-controls={`${id}-panel`} type="button" key={id} onClick={() => setTab(id)}><Icon size={16} />{label}</button>)}</div><div className="tab-rule" /></div>
    <div className="tab-content">
      <div id="explore-panel" role="tabpanel" aria-labelledby="explore-tab" hidden={tab !== 'explore'}>{tab === 'explore' && <JapanBrazilAtlas />}</div>
      <div id="globe-panel" role="tabpanel" aria-labelledby="globe-tab" hidden={tab !== 'globe'}>{tab === 'globe' && <GlobeSection />}</div>
      <div id="sources-panel" role="tabpanel" aria-labelledby="sources-tab" hidden={tab !== 'sources'}>{tab === 'sources' && <SourcesSection />}</div>
      <div id="simulations-panel" role="tabpanel" aria-labelledby="simulations-tab" hidden={tab !== 'simulations'}>{tab === 'simulations' && <Simulations selectedId={selectedId} setSelectedId={setSelectedId} setTab={setTab} />}</div>
      <div id="compare-panel" role="tabpanel" aria-labelledby="compare-tab" hidden={tab !== 'compare'}>{tab === 'compare' && <Compare simulation={simulation} />}</div>
      <div id="quiz-panel" role="tabpanel" aria-labelledby="quiz-tab" hidden={tab !== 'quiz'}>{tab === 'quiz' && <Quiz simulation={simulation} />}</div>
    </div>
    <footer><span>Built for “Dancing with the SARs”</span><span><Database size={13} /> <a href="https://nisar-docs.asf.alaska.edu/gcov/" target="_blank" rel="noreferrer">NISAR GCOV</a> · <a href="https://www.earthdata.nasa.gov/data/projects/opera" target="_blank" rel="noreferrer">OPERA DSWx</a> · <a href="https://nasa-gibs.github.io/gibs-api-docs/" target="_blank" rel="noreferrer">NASA GIBS</a></span></footer>
  </main>;
}

createRoot(document.getElementById('root')).render(<App />);
