import assert from 'node:assert/strict';
import {importTypescriptModule, test} from './test-support.mjs';

const geometryModule = await importTypescriptModule('../src/core/editor-geometry.ts');
const {fitNaturalSizeToCanvas, getBounds, normalizeCanvasBounds, normalizeTextBounds} = geometryModule;

test('getBounds normalizes drag direction', () => {
  assert.deepEqual(getBounds({x: 80, y: 90}, {x: 20, y: 10}), {
    x: 20,
    y: 10,
    width: 60,
    height: 80,
  });
});

test('normalizeCanvasBounds clips selection to the canvas', () => {
  assert.deepEqual(normalizeCanvasBounds({x: -10, y: 5, width: 50, height: 110}, {width: 100, height: 80}), {
    x: 0,
    y: 5,
    width: 40,
    height: 75,
  });

  assert.equal(normalizeCanvasBounds({x: 120, y: 10, width: 20, height: 20}, {width: 100, height: 80}), null);
});

test('normalizeTextBounds keeps a useful minimum box inside the canvas', () => {
  assert.deepEqual(normalizeTextBounds({x: 10, y: 20, width: 8, height: 8}, {width: 300, height: 200}), {
    x: 10,
    y: 20,
    width: 160,
    height: 48,
  });
});

test('fitNaturalSizeToCanvas scales large images and centers them', () => {
  assert.deepEqual(fitNaturalSizeToCanvas({naturalWidth: 200, naturalHeight: 100}, {width: 100, height: 100}), {
    x: 0,
    y: 25,
    width: 100,
    height: 50,
  });
});

console.log('Editor geometry tests passed.');
