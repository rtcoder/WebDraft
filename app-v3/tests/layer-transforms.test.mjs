import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {Buffer} from 'node:buffer';
import ts from 'typescript';

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

async function importTypescriptModule(path) {
  const url = new URL(path, import.meta.url);
  const source = await readFile(url, 'utf8');
  const {outputText} = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
      strict: true,
    },
    fileName: url.pathname,
  });
  const encoded = Buffer.from(outputText).toString('base64');

  return import(`data:text/javascript;base64,${encoded}`);
}

function test(name, run) {
  try {
    run();
  } catch (error) {
    error.message = `${name}: ${error.message}`;
    throw error;
  }
}

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
