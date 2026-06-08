import assert from 'node:assert/strict';
import {importTypescriptModule, test} from './test-support.mjs';

const floodFillModule = await importTypescriptModule('../src/core/flood-fill.ts');
const {floodFillImageData, hexToRgbaColor} = floodFillModule;

test('floodFillImageData fills only a contiguous matching region', () => {
  const imageData = image(3, 3, [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [10, 10, 10, 255],
    [0, 0, 0, 0],
    [10, 10, 10, 255],
    [10, 10, 10, 255],
    [10, 10, 10, 255],
    [10, 10, 10, 255],
    [10, 10, 10, 255],
  ]);

  const changed = floodFillImageData(imageData, 0, 0, {red: 200, green: 20, blue: 30, alpha: 255});

  assert.equal(changed, true);
  assert.deepEqual(pixels(imageData), [
    [200, 20, 30, 255],
    [200, 20, 30, 255],
    [10, 10, 10, 255],
    [200, 20, 30, 255],
    [10, 10, 10, 255],
    [10, 10, 10, 255],
    [10, 10, 10, 255],
    [10, 10, 10, 255],
    [10, 10, 10, 255],
  ]);
});

test('floodFillImageData returns false when replacement matches target', () => {
  const imageData = image(1, 1, [[4, 5, 6, 255]]);

  assert.equal(floodFillImageData(imageData, 0, 0, {red: 4, green: 5, blue: 6, alpha: 255}), false);
  assert.deepEqual(pixels(imageData), [[4, 5, 6, 255]]);
});

test('floodFillImageData ignores points outside image bounds', () => {
  const imageData = image(1, 1, [[4, 5, 6, 255]]);

  assert.equal(floodFillImageData(imageData, 2, 0, {red: 9, green: 9, blue: 9, alpha: 255}), false);
  assert.deepEqual(pixels(imageData), [[4, 5, 6, 255]]);
});

test('floodFillImageData fills similar colors when tolerance allows it', () => {
  const imageData = image(3, 1, [
    [10, 10, 10, 255],
    [12, 9, 10, 255],
    [30, 30, 30, 255],
  ]);

  const changed = floodFillImageData(imageData, 0, 0, {red: 200, green: 0, blue: 0, alpha: 255}, 3);

  assert.equal(changed, true);
  assert.deepEqual(pixels(imageData), [
    [200, 0, 0, 255],
    [200, 0, 0, 255],
    [30, 30, 30, 255],
  ]);
});

test('floodFillImageData keeps similar colors outside a zero tolerance fill', () => {
  const imageData = image(2, 1, [
    [10, 10, 10, 255],
    [11, 10, 10, 255],
  ]);

  floodFillImageData(imageData, 0, 0, {red: 200, green: 0, blue: 0, alpha: 255});

  assert.deepEqual(pixels(imageData), [
    [200, 0, 0, 255],
    [11, 10, 10, 255],
  ]);
});

test('hexToRgbaColor clamps opacity into alpha channel', () => {
  assert.deepEqual(hexToRgbaColor('#336699', 0.5), {red: 51, green: 102, blue: 153, alpha: 128});
  assert.deepEqual(hexToRgbaColor('#336699', 2), {red: 51, green: 102, blue: 153, alpha: 255});
});

console.log('Flood fill tests passed.');

function image(width, height, sourcePixels) {
  return {
    width,
    height,
    data: new Uint8ClampedArray(sourcePixels.flat()),
  };
}

function pixels(imageData) {
  const result = [];

  for (let index = 0; index < imageData.data.length; index += 4) {
    result.push([
      imageData.data[index],
      imageData.data[index + 1],
      imageData.data[index + 2],
      imageData.data[index + 3],
    ]);
  }

  return result;
}
