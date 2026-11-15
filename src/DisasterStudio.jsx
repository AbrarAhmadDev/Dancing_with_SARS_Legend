import React,{useEffect,useRef,useState} from 'react';
import {Play,Pause,RotateCcw,ArrowRight,Layers,BookOpen,ExternalLink,Plus,Minus,Map,Check} from 'lucide-react';
import {scenes,coverage,arrival,riverX} from './spread-model';
import './studio.css';
import './atlas.css';
import AtlasLocator from './AtlasLocator';
import {countries,DEMO_SECONDS,demoProgress,parseRoute} from './atlas-model';

function Landscape({kind,progress,zoom=1,opacity=1,onInspect}) {
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
      const alpha=coverage(kind,progress,x,y)*opacity;
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
  },[kind,progress,zoom,opacity]);
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
  const [route,setRoute]=useState(()=>parseRoute(window.location.hash));
  const [seconds,setSeconds]=useState(0),[playing,setPlaying]=useState(false);
  const [zoom,setZoom]=useState(1),[opacity,setOpacity]=useState(.9);
  const [inspect,setInspect]=useState('Click the landscape to inspect a location');
  const [left,setLeft]=useState(0),[right,setRight]=useState(1);
  const country=countries.find(c=>c.id===route.country),scene=scenes[country.sceneIndex];
  const progress=demoProgress(seconds),tab=route.tab;
  const stageIndex=Math.min(4,Math.floor(progress*4));
  function reset(){setPlaying(false);setSeconds(0);setZoom(1);setLeft(0);setRight(1);setInspect('Click the landscape to inspect a location');}
  function navigate(next){
    if(next.country!==route.country)reset();else setPlaying(false);
    setRoute(next);window.history.pushState(null,'',`#${next.tab}/${next.country}`);
  }
  function selectCountry(id){navigate({...route,country:id});}
  useEffect(()=>{
    const sync=()=>{setRoute(parseRoute(window.location.hash));reset();};
    window.addEventListener('hashchange',sync);window.addEventListener('popstate',sync);
    return()=>{window.removeEventListener('hashchange',sync);window.removeEventListener('popstate',sync);};
  },[]);
  useEffect(()=>{
    if(!playing)return;
    let previous=performance.now(),id;
    const tick=now=>{const delta=(now-previous)/1000;previous=now;setSeconds(s=>Math.min(DEMO_SECONDS,s+delta));id=requestAnimationFrame(tick);};
    id=requestAnimationFrame(tick);return()=>cancelAnimationFrame(id);
  },[playing]);
  useEffect(()=>{if(seconds>=DEMO_SECONDS)setPlaying(false);},[seconds]);
  useEffect(()=>{const hide=()=>{if(document.hidden)setPlaying(false);};document.addEventListener('visibilitychange',hide);return()=>document.removeEventListener('visibilitychange',hide);},[]);
  return <main className="studio" style={{'--accent':scene.color}}>
    <header className="studio-header"><div className="studio-brand"><span>◉</span><div>SURFACE / STORIES<small>DANCING WITH THE SARs</small></div></div><span className="header-note">Earth change, made visible.</span><a href={`#sources/${country.id}`} onClick={e=>{e.preventDefault();navigate({...route,tab:'sources'});}}>Data & methodology <ExternalLink size={13}/></a></header>
    <nav className="studio-tabs" aria-label="Application sections">{['atlas','compare','learn','sources'].map(t=><button key={t} aria-current={t===tab?'page':undefined} onClick={()=>navigate({...route,tab:t})}>{t==='atlas'?<Map size={16}/>:t==='compare'?<Layers size={16}/>:<BookOpen size={16}/>} {t[0].toUpperCase()+t.slice(1)}</button>)}</nav>
    <div className="studio-intro"><div><small>EARTH CHANGE ATLAS / JAPAN + BRAZIL</small><h1>Choose a place. Watch it change.</h1><p>Select a country and change type, then play its 30-second story.</p></div><span className="mode-pill">ILLUSTRATIVE SPREAD · REAL EVENT REFERENCES</span></div>
    {tab==='atlas'&&<AtlasLocator country={country} onSelect={selectCountry}/>}
    {(tab==='atlas'||tab==='compare')&&<div className="studio-workspace" id="country-visualization">
      <aside className="scene-sidebar">
        <small>02 / COUNTRY SECTIONS</small>
        {countries.map(c=>{const s=scenes[c.sceneIndex];return <button className={`scene-choice ${country.id===c.id?'selected':''}`} aria-pressed={country.id===c.id} key={c.id} onClick={()=>selectCountry(c.id)}><img src={s.image} alt=""/><span><small>{c.type.toUpperCase()} · 30 SEC</small><strong>{c.name} / {c.region}</strong><em>{s.event}</em></span>{country.id===c.id&&<Check size={17}/>}</button>;})}
        <div className="reading"><small>WHAT YOU’RE SEEING</small><h3>{scene.title}</h3><p>{scene.description}</p><div className="legend"><span><i style={{background:'#497b40'}}/>Vegetation</span><span><i style={{background:scene.color}}/>{scene.id==='flood'?'Floodwater':'Active fire / heat colors'}</span>{scene.id==='fire'&&<span><i style={{background:'#674334'}}/>Previously affected</span>}</div><p className="method-note">Illustrative terrain and progression, not a measured disaster footprint.{scene.id==='fire'&&' Red/orange indicate simulated fire activity, not measured temperature.'} Reference dates are historical; the animation shows relative stages.</p><a href={scene.source} target="_blank" rel="noreferrer">NASA event reference ↗</a></div>
      </aside>
      <section className="visual-main" aria-label={`${country.name} visualization`}>
        <div className="country-controls"><label>Change type<select aria-label="Change type" value={country.id} onChange={e=>selectCountry(e.target.value)}>{countries.map(c=><option key={c.id} value={c.id}>{c.type} — {c.name}</option>)}</select></label><label>Layer opacity <span className="opacity-value">{Math.round(opacity*100)}%</span><input aria-label="Layer opacity" type="range" min="0" max="1" step=".05" value={opacity} onChange={e=>setOpacity(Number(e.target.value))}/></label></div>
        <div className="visual-top"><span>{scene.region} <b> / {country.type.toUpperCase()}</b></span><span>ILLUSTRATIVE LANDSCAPE</span></div>
        {tab==='atlas'?<>
          <div className="landscape"><Landscape kind={scene.id} progress={progress} opacity={opacity} zoom={zoom} onInspect={setInspect}/><div className="landscape-badge">STAGE {stageIndex+1} / 5 · {Math.round(progress*100)}%</div><div className="landscape-tools"><button aria-label="Zoom in" onClick={()=>setZoom(z=>Math.min(2.5,z+.25))}><Plus size={16}/></button><button aria-label="Zoom out" onClick={()=>setZoom(z=>Math.max(1,z-.25))}><Minus size={16}/></button><button aria-label="Reset zoom" onClick={()=>setZoom(1)}><RotateCcw size={16}/></button></div><div className="landscape-caption"><small>{scene.stages[stageIndex]}</small><strong>{scene.title}</strong></div></div>
          <div className="player">
            <div className="play-row"><button className="accent" onClick={()=>{setSeconds(0);setPlaying(true);}}><Play size={16}/>Demo · 30 seconds</button><button aria-label={playing?'Pause demo':'Resume demo'} disabled={!playing&&seconds>=30} onClick={()=>setPlaying(p=>!p)}>{playing?<Pause size={16}/>:<Play size={16}/>}</button><button aria-label="Reset demo" onClick={reset}><RotateCcw size={16}/></button><span className="play-time" data-testid="playback-time">{seconds.toFixed(1)}s <span>/ 30.0s</span></span></div>
            <label className="timeline-label">Timeline <span>{playing?'Playing':seconds>=30?'Complete':'Paused'} · presentation time</span><input aria-label="Demo timeline" type="range" min="0" max="30" step=".1" value={seconds} onChange={e=>{setPlaying(false);setSeconds(Number(e.target.value));}}/></label>
            <div className="stage-track">{scene.stages.map((stage,i)=><button key={stage} className={stageIndex===i?'active':''} aria-label={`Go to stage ${i+1}: ${stage}`} onClick={()=>{setPlaying(false);setSeconds([0,7.5,15,22.5,30][i]);}}><small>{['00:00','00:07.5','00:15','00:22.5','00:30'][i]}</small><span>{stage}</span></button>)}</div>
            <p className="inspection" aria-live="polite">{inspect}</p>
          </div>
        </>:<><div className="studio-compare">{[[left,setLeft,'Earlier stage'],[right,setRight,'Later stage']].map(([value,setValue,label])=><figure key={label}><Landscape kind={scene.id} progress={value} opacity={opacity}/><figcaption>{label} · {Math.round(value*100)}% of simulation</figcaption><input aria-label={label} type="range" min="0" max="1" step=".01" value={value} onChange={e=>setValue(Number(e.target.value))}/></figure>)}</div><p className="comparison-note">Same country story and terrain. Set each stage independently; these are relative simulation stages, not observed dates.</p><button onClick={()=>navigate({...route,tab:'atlas'})}>Open {country.name} demo <ArrowRight size={16}/></button></>}
        <Reference scene={scene}/>
      </section>
    </div>}
    {tab==='learn'&&<Learn/>}
    {tab==='sources'&&<section className="sources" id="sources"><h2>Where the data comes from</h2><p>The Atlas uses Natural Earth country outlines and NASA Earth Observatory reference images. Japan is linked to Typhoon Hagibis in October 2019; Brazil is linked to the August 2019 Amazon fire season. These are historical reference events, not recent or live observations.</p><div className="audit-note"><h3>Pakistan imagery correction</h3><p>An earlier GIBS WMS 1.3.0 request used longitude-first coordinates with EPSG:4326, which requires latitude-first BBOX order. It selected the wrong region. Other previews had not been spatially aligned. Those views are withdrawn; no Japan or Brazil scene is labeled as Pakistan.</p></div><h3>Real context, illustrative progression</h3><p>Country outlines and the credited images below are real. Animation terrain, water boundaries, ignition, heat colors, and timing are synthetic. The 30 seconds describe presentation duration, not measured event duration. The canvas is a schematic teaching landscape, not a georeferenced satellite map, thermal measurement, NISAR analysis, or forecast.</p>{scenes.map(s=><div key={s.id}><Reference scene={s}/><p>{s.details}</p></div>)}<h3>How the animation works</h3><p>Flood cells activate progressively away from a river. Fire cells activate from one ignition with directional and terrain-like variation. Deterministic arrival times and smooth color transitions let you pause, compare, and replay the same sequence. Assets are bundled locally; no satellite service is contacted during playback.</p><a href="https://www.naturalearthdata.com/about/terms-of-use/" target="_blank" rel="noreferrer">Country boundaries: Natural Earth, public domain ↗</a></section>}
    <footer className="studio-footer"><span>NASA Space Apps / Dancing with the SARs</span><span>Reference imagery: NASA Earth Observatory · Boundaries: Natural Earth · Spread: illustrative</span></footer>
  </main>;
}
