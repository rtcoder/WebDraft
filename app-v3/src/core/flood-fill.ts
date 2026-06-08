export type RgbaColor = {
  red: number;
  green: number;
  blue: number;
  alpha: number;
};

export function floodFillImageData(imageData: ImageData, x: number, y: number, color: RgbaColor): boolean {
  const startX = Math.floor(x);
  const startY = Math.floor(y);

  if (startX < 0 || startY < 0 || startX >= imageData.width || startY >= imageData.height) {
    return false;
  }

  const target = getPixel(imageData, startX, startY);

  if (colorsMatch(target, color)) {
    return false;
  }

  const stack: Array<[number, number]> = [[startX, startY]];

  while (stack.length > 0) {
    const [currentX, currentY] = stack.pop() as [number, number];

    if (currentX < 0 || currentY < 0 || currentX >= imageData.width || currentY >= imageData.height) {
      continue;
    }

    if (!colorsMatch(getPixel(imageData, currentX, currentY), target)) {
      continue;
    }

    setPixel(imageData, currentX, currentY, color);
    stack.push(
      [currentX + 1, currentY],
      [currentX - 1, currentY],
      [currentX, currentY + 1],
      [currentX, currentY - 1],
    );
  }

  return true;
}

export function hexToRgbaColor(hex: string, opacity: number): RgbaColor {
  const normalized = hex.replace('#', '');

  return {
    red: Number.parseInt(normalized.slice(0, 2), 16),
    green: Number.parseInt(normalized.slice(2, 4), 16),
    blue: Number.parseInt(normalized.slice(4, 6), 16),
    alpha: Math.round(Math.min(Math.max(opacity, 0), 1) * 255),
  };
}

function getPixel(imageData: ImageData, x: number, y: number): RgbaColor {
  const index = getPixelIndex(imageData.width, x, y);
  const {data} = imageData;

  return {
    red: data[index],
    green: data[index + 1],
    blue: data[index + 2],
    alpha: data[index + 3],
  };
}

function setPixel(imageData: ImageData, x: number, y: number, color: RgbaColor): void {
  const index = getPixelIndex(imageData.width, x, y);
  const {data} = imageData;

  data[index] = color.red;
  data[index + 1] = color.green;
  data[index + 2] = color.blue;
  data[index + 3] = color.alpha;
}

function colorsMatch(first: RgbaColor, second: RgbaColor): boolean {
  return (
    first.red === second.red &&
    first.green === second.green &&
    first.blue === second.blue &&
    first.alpha === second.alpha
  );
}

function getPixelIndex(width: number, x: number, y: number): number {
  return (y * width + x) * 4;
}
