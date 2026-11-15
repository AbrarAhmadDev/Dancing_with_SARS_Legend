import React, { useMemo, useState } from 'react';
import { geoNaturalEarth1, geoMercator, geoPath, geoGraticule10 } from 'd3-geo';
import world from './data/world.json';
import { countries } from './atlas-model';

export default function AtlasLocator({ country, onSelect }) {
  const [focused, setFocused] = useState(false);
  const feature = world.features.find(f => f.properties.code === country.code);
  const projection = useMemo(() => focused
    ? geoMercator().fitExtent([[65, 20], [755, 280]], feature)
    : geoNaturalEarth1().fitExtent([[16, 16], [804, 284]], { type: 'Sphere' }), [focused, feature]);
  const path = geoPath(projection);
  return <section className="atlas-locator" aria-label="Country atlas">
    <div className="atlas-title"><div><small>01 / LOCATE AN EVENT</small><h2>Two countries. Two changing landscapes.</h2></div><button onClick={() => setFocused(f => !f)}>{focused ? 'World view' : `Focus ${country.name}`}</button></div>
    <svg viewBox="0 0 820 300" className="world-map" aria-label={`Geographic locator: ${focused ? country.name : 'world'}`}>
      <path d={path({ type: 'Sphere' })} fill="#112526" />
      <path d={path(geoGraticule10())} fill="none" stroke="#2c4645" strokeWidth=".5" />
      {world.features.filter(f => !focused || f.properties.code === country.code).map(f => {
        const available = countries.find(c => c.code === f.properties.code);
        const selected = country.code === f.properties.code;
        return <path key={f.properties.code} d={path(f)} fill={selected ? '#527b54' : available ? '#385f53' : '#253d35'} stroke={available ? '#a9c79b' : '#496052'} strokeWidth={available ? 1.2 : .5}
          role={available ? 'button' : undefined} tabIndex={available ? 0 : undefined} aria-label={available ? `Select ${available.name} on map` : undefined} aria-pressed={available ? selected : undefined}
          onClick={available ? () => { onSelect(available.id); setFocused(true); } : undefined}
          onKeyDown={available ? e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(available.id); setFocused(true); } } : undefined} />;
      })}
      {countries.filter(c => !focused || c.id === country.id).map(c => {
        const [x, y] = projection(c.coordinates), active = country.id === c.id;
        return <g key={c.id} transform={`translate(${x},${y})`} role="button" tabIndex="0" aria-label={`Open ${c.name} ${c.type}`} aria-pressed={active}
          onClick={() => { onSelect(c.id); setFocused(true); }} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(c.id); setFocused(true); } }}>
          <circle r="16" fill={c.id === 'japan' ? '#62ccff33' : '#ff975b33'} /><circle r="6" fill={c.id === 'japan' ? '#62ccff' : '#ff975b'} stroke="#fff" strokeWidth="1.5" />
          <text x="19" y="4" fill="#f3f5df" fontSize="13">{c.name}</text>
        </g>;
      })}
    </svg>
    <div className="atlas-map-note"><span>Markers locate reference regions, not disaster boundaries.</span><a href="https://www.naturalearthdata.com/about/terms-of-use/" target="_blank" rel="noreferrer">Made with Natural Earth</a></div>
  </section>;
}
