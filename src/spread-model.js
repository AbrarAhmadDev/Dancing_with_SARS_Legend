export const SCENE_SECONDS = 15;
export const TOUR_SECONDS = 30;
export const scenes = [
  { id:'flood', title:'When the river rises', region:'Honshu, Japan', event:'Typhoon Hagibis · October 2019', color:'#59c6ff', source:'https://science.nasa.gov/earth/earth-observatory/hagibis-floods-japan-145736/', image:'/data/references/japan-hagibis.jpg', imageDate:'13 October 2019', credit:'NASA Earth Observatory / Joshua Stevens; Aqua MODIS', description:'A river fills, spills over its banks, and slowly occupies the surrounding floodplain.', stages:['River within banks','Water approaches the banks','Floodplain begins to fill','Water reaches adjacent fields','Expanded inundation'], details:'The historical event is documented by NASA. The green terrain and blue inundation below are a synthetic teaching landscape; they do not reproduce Honshu’s measured flood boundary.' },
  { id:'fire', title:'Following a fire front', region:'Brazilian Amazon, South America', event:'Amazon fire season · August 2019', color:'#ff9a5f', source:'https://science.nasa.gov/earth/earth-observatory/fires-in-brazil-145464/', image:'/data/references/brazil-fires-aug11.jpg', imageDate:'11 August 2019', credit:'NASA Earth Observatory / Lauren Dauphin; MODIS, VIIRS / LANCE', description:'A single ignition spreads into adjoining vegetation, leaving a darker affected interior behind the orange front.', stages:['Unburned vegetation','Initial ignition','Front grows through vegetation','Spread extends downwind','Expanded affected footprint'], details:'NASA documents multiple fires across the Brazilian Amazon. This synthetic single-front illustration explains spread; it is not a measured perimeter, burn severity map, or forecast.' }
];
export function tourPosition(seconds) {
  const t=Math.max(0,Math.min(TOUR_SECONDS,seconds));
  return { sceneIndex:t<SCENE_SECONDS?0:1, progress:t<SCENE_SECONDS?t/SCENE_SECONDS:(t-SCENE_SECONDS)/SCENE_SECONDS };
}
export const riverX = y => .43 + .095*Math.sin(y*8) + .035*Math.sin(y*18);
export function arrival(kind,x,y) {
  if(kind==='flood') return .14+Math.abs(x-riverX(y))/(.27+.035*Math.sin(y*23)+.02*Math.cos(y*41)) + y*.08;
  const dx=x-.31,dy=y-.54;
  const angle=Math.atan2(dy,dx);
  const vegetationResistance=1+.10*Math.sin(angle*5)+.06*Math.cos(angle*9);
  return .08 + Math.sqrt((dx/(dx>0?.65:.30))**2+(dy/.38)**2)*vegetationResistance;
}
export function coverage(kind,p,x,y) {
  const a=arrival(kind,x,y);
  return Math.max(0,Math.min(1,(p-a)/.045));
}
