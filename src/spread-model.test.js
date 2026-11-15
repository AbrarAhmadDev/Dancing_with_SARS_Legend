import {expect,it} from 'vitest';
import {tourPosition,coverage,scenes} from './spread-model';
it('gives each chapter exactly 15 seconds and clamps endpoints',()=>{
 expect(tourPosition(0)).toEqual({sceneIndex:0,progress:0});
 expect(tourPosition(14.99).sceneIndex).toBe(0);
 expect(tourPosition(15)).toEqual({sceneIndex:1,progress:0});
 expect(tourPosition(30)).toEqual({sceneIndex:1,progress:1});
 expect(tourPosition(35)).toEqual(tourPosition(30));
});
it('progresses deterministically without reverting affected cells or starting at full extent',()=>{
 for(const scene of scenes){let previous=0;
  for(const t of [0,.25,.5,.75,1]){
   let area=0;for(let y=0;y<1;y+=.025)for(let x=0;x<1;x+=.025){const v=coverage(scene.id,t,x,y);expect(v).toBeGreaterThanOrEqual(0);expect(v).toBeLessThanOrEqual(1);expect(v).toBeGreaterThanOrEqual(coverage(scene.id,Math.max(0,t-.25),x,y));area+=v;}
   if(t===0)expect(area).toBe(0);else expect(area).toBeGreaterThan(previous);
   previous=area;
  }
 }
});
