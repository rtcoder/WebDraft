import type {Point, Size, SizeWithPosition} from './types';

export type NaturalSize = {
  naturalWidth: number;
  naturalHeight: number;
};

export function getBounds(start: Point, end: Point): SizeWithPosition {
  const x = Math.min(start.x, end.x);
  const y = Math.min(start.y, end.y);
  const width = Math.abs(end.x - start.x);
  const height = Math.abs(end.y - start.y);

  return {x, y, width, height};
}

export function fitNaturalSizeToCanvas(source: NaturalSize, canvasSize: Size): SizeWithPosition {
  const ratio = Math.min(canvasSize.width / source.naturalWidth, canvasSize.height / source.naturalHeight, 1);
  const width = source.naturalWidth * ratio;
  const height = source.naturalHeight * ratio;

  return {
    x: (canvasSize.width - width) / 2,
    y: (canvasSize.height - height) / 2,
    width,
    height,
  };
}

export function normalizeCanvasBounds(bounds: SizeWithPosition, canvasSize: Size): SizeWithPosition | null {
  const x = Math.max(0, Math.round(bounds.x));
  const y = Math.max(0, Math.round(bounds.y));
  const right = Math.min(canvasSize.width, Math.round(bounds.x + bounds.width));
  const bottom = Math.min(canvasSize.height, Math.round(bounds.y + bounds.height));
  const width = right - x;
  const height = bottom - y;

  if (width < 1 || height < 1) {
    return null;
  }

  return {x, y, width, height};
}

export function normalizeTextBounds(bounds: SizeWithPosition, canvasSize: Size): SizeWithPosition {
  const x = Math.max(0, Math.round(bounds.x));
  const y = Math.max(0, Math.round(bounds.y));
  const width = Math.max(160, Math.min(canvasSize.width - x, Math.round(bounds.width)));
  const height = Math.max(48, Math.min(canvasSize.height - y, Math.round(bounds.height)));

  return {x, y, width, height};
}
