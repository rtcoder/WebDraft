import type {MirrorAxis, PixelBuffer, RotationDirection} from '../types';

export function invertPixelBuffer(buffer: PixelBuffer): PixelBuffer {
  const output = clonePixelBuffer(buffer);

  for (let index = 0; index < output.data.length; index += 4) {
    output.data[index] = 255 - output.data[index];
    output.data[index + 1] = 255 - output.data[index + 1];
    output.data[index + 2] = 255 - output.data[index + 2];
  }

  return output;
}

export function rotatePixelBuffer(buffer: PixelBuffer, direction: RotationDirection): PixelBuffer {
  const output: PixelBuffer = {
    width: buffer.height,
    height: buffer.width,
    data: new Uint8ClampedArray(buffer.width * buffer.height * 4),
  };

  for (let y = 0; y < buffer.height; y += 1) {
    for (let x = 0; x < buffer.width; x += 1) {
      const target =
        direction === 'right'
          ? {x: buffer.height - 1 - y, y: x}
          : {x: y, y: buffer.width - 1 - x};

      copyPixel(buffer, output, x, y, target.x, target.y);
    }
  }

  return output;
}

export function mirrorPixelBuffer(buffer: PixelBuffer, axis: MirrorAxis): PixelBuffer {
  const output = createEmptyPixelBuffer(buffer);

  for (let y = 0; y < buffer.height; y += 1) {
    for (let x = 0; x < buffer.width; x += 1) {
      const target = {
        x: axis === 'horizontal' ? buffer.width - 1 - x : x,
        y: axis === 'vertical' ? buffer.height - 1 - y : y,
      };

      copyPixel(buffer, output, x, y, target.x, target.y);
    }
  }

  return output;
}

function clonePixelBuffer(buffer: PixelBuffer): PixelBuffer {
  return {
    width: buffer.width,
    height: buffer.height,
    data: new Uint8ClampedArray(buffer.data),
  };
}

function createEmptyPixelBuffer(buffer: PixelBuffer): PixelBuffer {
  return {
    width: buffer.width,
    height: buffer.height,
    data: new Uint8ClampedArray(buffer.data.length),
  };
}

function copyPixel(
  source: PixelBuffer,
  target: PixelBuffer,
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
): void {
  if (targetX < 0 || targetY < 0 || targetX >= target.width || targetY >= target.height) {
    return;
  }

  const sourceIndex = getPixelIndex(source.width, sourceX, sourceY);
  const targetIndex = getPixelIndex(target.width, targetX, targetY);

  target.data[targetIndex] = source.data[sourceIndex];
  target.data[targetIndex + 1] = source.data[sourceIndex + 1];
  target.data[targetIndex + 2] = source.data[sourceIndex + 2];
  target.data[targetIndex + 3] = source.data[sourceIndex + 3];
}

function getPixelIndex(width: number, x: number, y: number): number {
  return (y * width + x) * 4;
}
