import assert from 'node:assert/strict';
import {importTypescriptModule, test} from './test-support.mjs';

const transformModule = await importTypescriptModule('../src/core/layer-transforms.ts');
const {invertPixelBuffer, mirrorPixelBuffer, rotatePixelBuffer} = transformModule;

test('invertPixelBuffer inverts RGB channels and keeps alpha', () => {
  const source = pixelBuffer(1, 2, [
    [10, 20, 30, 40],
    [255, 128, 0, 255],
  ]);

  const result = invertPixelBuffer(source);

  assertPixels(result, [
    [245, 235, 225, 40],
    [0, 127, 255, 255],
  ]);
  assertPixels(source, [
    [10, 20, 30, 40],
    [255, 128, 0, 255],
  ]);
});

test('mirrorPixelBuffer mirrors horizontally', () => {
  const source = pixelBuffer(2, 2, [
    [1, 0, 0, 255],
    [2, 0, 0, 255],
    [3, 0, 0, 255],
    [4, 0, 0, 255],
  ]);

  assertPixels(mirrorPixelBuffer(source, 'horizontal'), [
    [2, 0, 0, 255],
    [1, 0, 0, 255],
    [4, 0, 0, 255],
    [3, 0, 0, 255],
  ]);
});

test('mirrorPixelBuffer mirrors vertically', () => {
  const source = pixelBuffer(2, 2, [
    [1, 0, 0, 255],
    [2, 0, 0, 255],
    [3, 0, 0, 255],
    [4, 0, 0, 255],
  ]);

  assertPixels(mirrorPixelBuffer(source, 'vertical'), [
    [3, 0, 0, 255],
    [4, 0, 0, 255],
    [1, 0, 0, 255],
    [2, 0, 0, 255],
  ]);
});

test('rotatePixelBuffer rotates square buffers right and left', () => {
  const source = pixelBuffer(3, 3, [
    [1, 0, 0, 255],
    [2, 0, 0, 255],
    [3, 0, 0, 255],
    [4, 0, 0, 255],
    [5, 0, 0, 255],
    [6, 0, 0, 255],
    [7, 0, 0, 255],
    [8, 0, 0, 255],
    [9, 0, 0, 255],
  ]);

  assertPixels(rotatePixelBuffer(source, 'right'), [
    [7, 0, 0, 255],
    [4, 0, 0, 255],
    [1, 0, 0, 255],
    [8, 0, 0, 255],
    [5, 0, 0, 255],
    [2, 0, 0, 255],
    [9, 0, 0, 255],
    [6, 0, 0, 255],
    [3, 0, 0, 255],
  ]);

  assertPixels(rotatePixelBuffer(source, 'left'), [
    [3, 0, 0, 255],
    [6, 0, 0, 255],
    [9, 0, 0, 255],
    [2, 0, 0, 255],
    [5, 0, 0, 255],
    [8, 0, 0, 255],
    [1, 0, 0, 255],
    [4, 0, 0, 255],
    [7, 0, 0, 255],
  ]);
});

console.log('Layer transform tests passed.');

function pixelBuffer(width, height, pixels) {
  return {
    width,
    height,
    data: new Uint8ClampedArray(pixels.flat()),
  };
}

function assertPixels(buffer, expectedPixels) {
  assert.deepEqual([...buffer.data], expectedPixels.flat());
}
