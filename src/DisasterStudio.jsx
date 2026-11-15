import React,{useEffect,useRef,useState} from 'react';
import {Play,Pause,RotateCcw,ArrowRight,Layers,BookOpen,ExternalLink,Plus,Minus,Map,Check} from 'lucide-react';
import {scenes,tourPosition,coverage,arrival,riverX} from './spread-model';
import './studio.css';

function Landscape({kind,progress,zoom=1,onInspect}) {
  const ref=useRef(null);
  useEffect(()=>{
    const c=ref.current,ctx=c.getContext('2d');
    const W=900,H=550,step=3;
    ctx.save();ctx.clearRect(0,0,W,H);ctx.translate(W/2,H/2);ctx.scale(zoom,zoom);ctx.translate(-W/2,-H/2);
    for(let py=0;py<H;py+=step) for(let px=0;px<W;px+=step){
      const x=px/W,y=py/H;
      const noise=(Math.sin(px*12.9898+py*78.233)*43758.5453)%1;
      const relief=9*Math.sin(x*25+y*9)+7*Math.cos(y*30-x*6)+noise*6;
      const field=(Math.floor(x*19)+Math.floor(y*14))%3;
      let rgb=kind==='flood'?[43+relief+field*7,82+relief+field*6,48+relief]:[28+relief,67+relief,41+relief];
      const river=Math.abs(x-riverX(y))<.009;
      if(kind==='flood'&&river) rgb=[39,117,153];
      const alpha=coverage(kind,progress,x,y);
      const age=progress-arrival(kind,x,y);
      const target=kind==='flood'?[34,137+20*noise,215+12*noise]:age<.09?[255,126+noise*32,38]:age<.19?[192,64,31]:[76+relief/2,49,36];
      ctx.fillStyle=`rgb(${rgb.map((v,i)=>v*(1-alpha)+target[i]*alpha).join(',')})`;ctx.fillRect(px,py,step+.3,step+.3);
    }
    // Schematic roads, fields, and settlement; no geographic coordinates implied.
    ctx.strokeStyle='#ddd6ae55';ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(0,435);ctx.bezierCurveTo(250,310,560,390,900,270);ctx.stroke();
    if(kind==='flood'){
      ctx.strokeStyle='#ccdca122';ctx.lineWidth=1;
      for(let i=0;i<15;i++){ctx.beginPath();ctx.moveTo(i*72,0);ctx.lineTo(i*72-100,550);ctx.stroke();}
      for(let i=0;i<10;i++){ctx.beginPath();ctx.moveTo(0,i*64);ctx.lineTo(900,i*64-30);ctx.stroke();}
      for(let i=0;i<26;i++){const x=650+(i%6)*15,y=360+Math.floor(i/6)*16;ctx.fillStyle='#c7d0bd';ctx.fillRect(x,y,9,7);}
    }
    ctx.restore();
  },[kind,progress,zoom]);
  return <canvas ref={ref} width="900" height="550" role="img" aria-label={`${kind} illustrative landscape at ${Math.round(progress*100)}% of the sequence`} onClick={e=>{const r=e.currentTarget.getBoundingClientRect();const x=((e.clientX-r.left)/r.width-.5)/zoom+.5,y=((e.clientY-r.top)/r.height-.5)/zoom+.5;onInspect?.(coverage(kind,progress,x,y)>.5?'Affected in this simulation':'Unchanged at this stage');}}/>;
}

function Reference({scene}){return <article className="reference-card"><img src={scene.image} alt={`NASA satellite reference: ${scene.region}, ${scene.imageDate}`} loading="lazy"/><div><small>REAL SATELLITE REFERENCE · {scene.imageDate}</small><h3>{scene.event}</h3><p>{scene.credit}</p><a href={scene.source} target="_blank" rel="noreferrer">Read NASA’s event report <ExternalLink size={14}/></a></div></article>;}

function Learn(){
  const [q,setQ]=useState(0),[answer,setAnswer]=useState(null),[score,setScore]=useState(0),[done,setDone]=useState(false);
  const questions=[
    {scene:0,title:'Where does the blue area expand first?',options:['Across every hill simultaneously','Outward from the existing river','At isolated random locations'],correct:1,why:'The illustration grows continuously from the river corridor into nearby land. Blue is a display color, not the natural color of sediment-rich water.'},
    {scene:1,title:'What does the orange edge represent here?',options:['The advancing synthetic fire front','Measured air temperature','A flood boundary'],correct:0,why:'The orange edge is the simulated advancing front. The darker interior represents previously affected vegetation; neither is a measured burn-severity class.'},
    {scene:0,title:'Can this animation tell you which real homes flooded?',options:['Yes, all roads are geographically exact','Yes, the timing is observed hourly','No; the terrain and progression are synthetic'],correct:2,why:'The NASA reference verifies the historical event. The animation is a schematic teaching model with no real building exposure calculation.'}
  ];const item=questions[q],scene=scenes[item.scene];
  if(done)return <section className="lesson"><small>CLASSROOM COMPLETE</small><h2>{score} of {questions.length} correct</h2><p>You compared flood expansion, a fire front, and the distinction between simulation and observation.</p><button onClick={()=>{setDone(false);setQ(0);setScore(0);setAnswer(null);}}>Try again</button></section>;
  return <section className="lesson"><small>MAP CLASSROOM · {q+1} / {questions.length}</small><h2>{item.title}</h2><div className="lesson-pair"><figure><Landscape kind={scene.id} progress={.06}/><figcaption>Beginning · illustrative</figcaption></figure><figure><Landscape kind={scene.id} progress={.88}/><figcaption>Later stage · illustrative</figcaption></figure></div><div className="answers">{item.options.map((a,i)=><button key={a} disabled={answer!==null} className={answer!==null&&i===item.correct?'correct':''} onClick={()=>{setAnswer(i);if(i===item.correct)setScore(s=>s+1);}}>{a}</button>)}</div>{answer!==null&&<p className="feedback">{answer===item.correct?'Correct. ':'Take another look. '}{item.why}</p>}<button className="accent" disabled={answer===null} onClick={()=>{if(q===questions.length-1)setDone(true);else{setQ(q+1);setAnswer(null);}}}>{q===questions.length-1?'Finish':'Next question'} <ArrowRight size={16}/></button><Reference scene={scene}/></section>;
}

export default function DisasterStudio(){
  const [tab,setTab]=useState('Visualizations'),[seconds,setSeconds]=useState(0),[playing,setPlaying]=useState(false),[zoom,setZoom]=useState(1),[inspect,setInspect]=useState('Click the landscape to inspect a location'),[left,setLeft]=useState(0),[right,setRight]=useState(1);
  const {sceneIndex,progress}=tourPosition(seconds),scene=scenes[sceneIndex];
  useEffect(()=>{if(!playing)return;let previous=performance.now(),id;const tick=now=>{const delta=(now-previous)/1000;previous=now;setSeconds(s=>Math.min(30,s+delta));id=requestAnimationFrame(tick);};id=requestAnimationFrame(tick);return()=>cancelAnimationFrame(id);},[playing]);
  useEffect(()=>{if(seconds>=30)setPlaying(false);},[seconds]);
  useEffect(()=>{setZoom(1);setInspect('Click the landscape to inspect a location');},[sceneIndex]);
  useEffect(()=>{const hide=()=>{if(document.hidden)setPlaying(false);};document.addEventListener('visibilitychange',hide);return()=>document.removeEventListener('visibilitychange',hide);},[]);
  function selectScene(i){setPlaying(false);setSeconds(i*15);setLeft(0);setRight(1);}
  return <main className="studio" style={{'--accent':scene.color}}>
    <header className="studio-header"><div className="studio-brand"><span>◉</span><div>SURFACE / STORIES<small>DANCING WITH THE SARs</small></div></div><span className="header-note">Earth change, made visible.</span><a href="#sources" onClick={()=>{setPlaying(false);setTab('Sources');}}>Data & methodology <ExternalLink size={13}/></a></header>
    <nav className="studio-tabs" aria-label="Application sections">{['Visualizations','Compare','Learn','Sources'].map(t=><button key={t} aria-current={t===tab?'page':undefined} onClick={()=>{setTab(t);setPlaying(false);}}>{t==='Visualizations'?<Map size={16}/>:t==='Compare'?<Layers size={16}/>:<BookOpen size={16}/>} {t}</button>)}</nav>
    <div className="studio-intro"><div><small>EARTH CHANGE STUDIO / 01</small><h1>Watch a landscape change.</h1><p>Follow water across a floodplain. Trace a fire through vegetation.</p></div><span className="mode-pill">ILLUSTRATIVE SIMULATION · REAL EVENT REFERENCES</span></div>
    {(tab==='Visualizations'||tab==='Compare')&&<div className="studio-workspace"><aside className="scene-sidebar"><small>CHOOSE AN EVENT</small>{scenes.map((s,i)=><button className={`scene-choice ${sceneIndex===i?'selected':''}`} key={s.id} onClick={()=>selectScene(i)}><img src={s.image} alt=""/><span><small>0{i+1} / {s.id.toUpperCase()} · 15 SEC</small><strong>{s.region}</strong><em>{s.event}</em></span>{sceneIndex===i&&<Check size={17}/>}</button>)}<div className="reading"><small>WHAT YOU’RE SEEING</small><h3>{scene.title}</h3><p>{scene.description}</p><div className="legend"><span><i style={{background:'#497b40'}}/>Vegetation</span><span><i style={{background:scene.color}}/>{scene.id==='flood'?'Floodwater':'Active fire front'}</span>{scene.id==='fire'&&<span><i style={{background:'#674334'}}/>Previously affected</span>}</div><p className="method-note">Synthetic terrain and progression. Historical dates belong to the reference imagery; the animation uses relative stages.</p><a href={scene.source} target="_blank" rel="noreferrer">NASA event reference ↗</a></div></aside>
    <section className="visual-main"><div className="visual-top"><span>{scene.region} <b> / {scene.id.toUpperCase()}</b></span><span>SCHEMATIC LANDSCAPE</span></div>
      {tab==='Visualizations'?<><div className="landscape"><Landscape kind={scene.id} progress={progress} zoom={zoom} onInspect={setInspect}/><div className="landscape-badge">ILLUSTRATIVE · {Math.round(progress*100)}% through sequence</div><div className="landscape-tools"><button aria-label="Zoom in" onClick={()=>setZoom(z=>Math.min(2.5,z+.25))}><Plus size={16}/></button><button aria-label="Zoom out" onClick={()=>setZoom(z=>Math.max(1,z-.25))}><Minus size={16}/></button><button aria-label="Reset zoom" onClick={()=>setZoom(1)}><RotateCcw size={16}/></button></div><div className="landscape-caption"><small>{scene.stages[Math.min(4,Math.floor(progress*5))]}</small><strong>{scene.title}</strong></div></div>
      <div className="player"><div className="play-row"><button className="accent" onClick={()=>{if(seconds>=30)setSeconds(0);setPlaying(!playing);}}>{playing?<Pause size={16}/>:<Play size={16}/>} {playing?'Pause':'Play sequence'}</button><button aria-label="Restart both scenes" onClick={()=>{setSeconds(0);setPlaying(false);}}><RotateCcw size={16}/></button><span className="play-time">{seconds.toFixed(1)}s <span>/ 30.0s</span></span><small>15s FLOOD → 15s FIRE</small></div><input aria-label="Sequence time" type="range" min="0" max="30" step="0.05" value={seconds} onChange={e=>{setPlaying(false);setSeconds(Number(e.target.value));}}/><div className="time-labels"><span>00:00 · Japan flood</span><span>00:15 · Brazil fire</span><span>00:30</span></div><p className="inspection" aria-live="polite">{inspect}</p></div></>:<><div className="studio-compare">{[[left,setLeft,'Earlier stage'],[right,setRight,'Later stage']].map(([value,setValue,label])=><figure key={label}><Landscape kind={scene.id} progress={value}/><figcaption>{label} · {Math.round(value*100)}% of simulation</figcaption><input aria-label={label} type="range" min="0" max="1" step=".01" value={value} onChange={e=>setValue(Number(e.target.value))}/></figure>)}</div><p className="comparison-note">Both panels use the same schematic terrain. Set each stage independently to inspect the spreading footprint.</p></>}
      <Reference scene={scene}/></section></div>}
    {tab==='Learn'&&<Learn/>}
    {tab==='Sources'&&<section className="sources" id="sources"><h2>Where the data comes from</h2><p>The previous Pakistan library used NASA CMR / ASF NISAR browse images, PO.DAAC OPERA DSWx previews, and NASA GIBS MODIS / VIIRS images. A country label alone did not verify the extent or alignment of those assets.</p><div className="audit-note"><h3>Pakistan imagery audit</h3><p>A previous WMS 1.3.0 request used BBOX=60,23,77,37 with EPSG:4326. That CRS requires latitude first, so the request selected the wrong region. National imagery was also presented under a local Indus Delta label, and browse images were blended with unrelated context without georeferencing. Those views have been withdrawn from the active interface pending proper spatial validation.</p></div><h3>What is real, and what is simulated?</h3><p>The NASA articles and credited satellite images below are real observations of Japan and Brazil. The animation is entirely synthetic: terrain, river, ignition, affected footprint, and timing. It is an educational visualization inspired by documented event types, with no claim to reconstruct the measured events. A 15-second scene is presentation time, not an observed duration.</p>{scenes.map(s=><div key={s.id}><Reference scene={s}/><p>{s.details}</p></div>)}<h3>Animation method</h3><p>Flood cells activate progressively with distance from a meandering river. Fire cells activate outward from one ignition with a directional bias. Both use deterministic arrival times and smooth transitions, so scrubbing is reversible and repeating a stage yields the same footprint. This is a conceptual model, not a hydraulic or wildfire forecast.</p><a href="https://nasa-gibs.github.io/gibs-api-docs/access-basics/" target="_blank" rel="noreferrer">NASA GIBS coordinate and imagery documentation ↗</a></section>}
    <footer className="studio-footer"><span>NASA Space Apps / Dancing with the SARs</span><span>Reference imagery: NASA Earth Observatory · Animation: illustrative</span></footer>
  </main>;
}
