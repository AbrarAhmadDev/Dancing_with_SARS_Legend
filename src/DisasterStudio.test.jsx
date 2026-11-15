// @vitest-environment jsdom
import React from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import DisasterStudio from './DisasterStudio';

let callbacks, frameId, now;
beforeEach(() => {
  window.history.replaceState(null, '', '/#atlas/japan');
  callbacks = new Map(); frameId = 0; now = 0;
  vi.spyOn(performance, 'now').mockImplementation(() => now);
  vi.stubGlobal('requestAnimationFrame', callback => { callbacks.set(++frameId, callback); return frameId; });
  vi.stubGlobal('cancelAnimationFrame', id => callbacks.delete(id));
  // Rendering is checked in the real browser; component tests isolate playback state.
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ save(){}, restore(){}, clearRect(){}, translate(){}, scale(){}, fillRect(){}, beginPath(){}, moveTo(){}, bezierCurveTo(){}, lineTo(){}, stroke(){} });
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
function advance(seconds) {
  act(() => { now += seconds * 1000; const pending = [...callbacks.values()]; callbacks.clear(); pending.forEach(cb => cb(now)); });
}

it('runs a selected event for 30 seconds, pauses, resumes, and restarts from zero', () => {
  render(<DisasterStudio/>);
  fireEvent.click(screen.getByRole('button', { name: 'Demo · 30 seconds' }));
  advance(15);
  expect(screen.getByTestId('playback-time').textContent).toContain('15.0s');
  expect(screen.getByRole('img', { name: 'flood illustrative landscape at 50% of the sequence' })).toBeTruthy();
  fireEvent.click(screen.getByLabelText('Pause demo')); advance(5);
  expect(screen.getByTestId('playback-time').textContent).toContain('15.0s');
  fireEvent.click(screen.getByLabelText('Resume demo')); advance(15);
  expect(screen.getByTestId('playback-time').textContent).toContain('30.0s');
  expect(screen.getByLabelText('Resume demo').disabled).toBe(true);
  expect(callbacks.size).toBe(0);
  fireEvent.click(screen.getByRole('button', { name: 'Demo · 30 seconds' }));
  expect(screen.getByTestId('playback-time').textContent).toContain('0.0s');
});
it('switches country and imagery, resets playback, and lets sliders seek exact stages', () => {
  render(<DisasterStudio/>);
  fireEvent.change(screen.getByLabelText('Demo timeline'), { target: { value: '22.5' } });
  fireEvent.change(screen.getByLabelText('Change type'), { target: { value: 'brazil' } });
  expect(window.location.hash).toBe('#atlas/brazil');
  expect(screen.getByTestId('playback-time').textContent).toContain('0.0s');
  expect(screen.getByRole('img', { name: /NASA satellite reference: Brazilian/ }).getAttribute('src')).toContain('brazil');
  fireEvent.click(screen.getByRole('button', { name: 'Demo · 30 seconds' })); advance(15);
  expect(screen.getByRole('img', { name: 'fire illustrative landscape at 50% of the sequence' })).toBeTruthy();
  fireEvent.change(screen.getByLabelText('Demo timeline'), { target: { value: '9' } });
  expect(screen.getByLabelText('Resume demo').disabled).toBe(false);
  expect(screen.getByRole('img', { name: 'fire illustrative landscape at 30% of the sequence' })).toBeTruthy();
  fireEvent.change(screen.getByLabelText('Layer opacity'), { target: { value: '.4' } });
  expect(screen.getByText('40%')).toBeTruthy();
});
it('opens country deep links and keeps comparison stages independent', () => {
  window.history.replaceState(null, '', '/#compare/brazil');
  render(<DisasterStudio/>);
  expect(screen.getByRole('img', { name: 'fire illustrative landscape at 0% of the sequence' })).toBeTruthy();
  expect(screen.getByRole('img', { name: 'fire illustrative landscape at 100% of the sequence' })).toBeTruthy();
  fireEvent.change(screen.getByLabelText('Earlier stage'), { target: { value: '.3' } });
  expect(screen.getByRole('img', { name: 'fire illustrative landscape at 30% of the sequence' })).toBeTruthy();
  expect(screen.getByLabelText('Later stage').value).toBe('1');
});
