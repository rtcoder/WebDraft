import type {EditorState, Point, SizeWithPosition} from './types';
import {Tool} from './types';

export {drawRichText} from './rich-text-renderer';

export function drawShape(
  context: CanvasRenderingContext2D,
  bounds: SizeWithPosition,
  state: EditorState,
): void {
  if (bounds.width < 1 || bounds.height < 1) {
    return;
  }

  applyStroke(context, state);
  context.beginPath();

  if (state.activeTool === Tool.Rectangle) {
    context.rect(bounds.x, bounds.y, bounds.width, bounds.height);
  }

  if (state.activeTool === Tool.Ellipse) {
    context.ellipse(
      bounds.x + bounds.width / 2,
      bounds.y + bounds.height / 2,
      bounds.width / 2,
      bounds.height / 2,
      0,
      0,
      Math.PI * 2,
    );
  }

  if (state.fillEnabled) {
    context.fill();
  }

  context.stroke();
}

export function drawPoint(context: CanvasRenderingContext2D, point: Point, state: EditorState): void {
  applyBrush(context, state);

  context.beginPath();
  context.arc(point.x, point.y, state.size / 2, 0, Math.PI * 2);
  context.fill();
}

export function drawLine(context: CanvasRenderingContext2D, start: Point, end: Point, state: EditorState): void {
  applyBrush(context, state);

  context.beginPath();
  context.moveTo(start.x, start.y);
  context.lineTo(end.x, end.y);
  context.stroke();
}

export function drawWebLine(
  context: CanvasRenderingContext2D,
  point: Point,
  points: Point[],
  state: EditorState,
): Point[] {
  const previousPoint = points[points.length - 1];

  if (!previousPoint) {
    return [...points, point];
  }

  applyBrush(context, state);
  context.beginPath();
  context.moveTo(previousPoint.x, previousPoint.y);
  context.lineTo(point.x, point.y);
  context.stroke();

  const sensitivitySquared = state.webSensitivity * state.webSensitivity;

  for (const pastPoint of points) {
    const dx = pastPoint.x - point.x;
    const dy = pastPoint.y - point.y;
    const distanceSquared = dx * dx + dy * dy;

    if (distanceSquared > 0 && distanceSquared < sensitivitySquared) {
      context.beginPath();
      context.moveTo(point.x + dx * 0.2, point.y + dy * 0.2);
      context.lineTo(pastPoint.x - dx * 0.2, pastPoint.y - dy * 0.2);
      context.stroke();
    }
  }

  return [...points, point];
}

export function applyBrush(context: CanvasRenderingContext2D, state: EditorState): void {
  context.lineCap = 'round';
  context.lineJoin = 'round';
  context.lineWidth = state.size;

  if (state.activeTool === Tool.Eraser) {
    context.globalCompositeOperation = 'destination-out';
    context.shadowBlur = 0;
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;
    context.strokeStyle = '#000000';
    context.fillStyle = '#000000';
    return;
  }

  context.globalCompositeOperation = 'source-over';
  context.strokeStyle = state.color;
  context.fillStyle = state.color;
  applyShadow(context, state);
}

export function applyStroke(context: CanvasRenderingContext2D, state: EditorState): void {
  context.globalCompositeOperation = 'source-over';
  context.lineCap = 'round';
  context.lineJoin = 'round';
  context.lineWidth = state.size;
  context.strokeStyle = state.color;
  context.fillStyle = hexToRgba(state.fillColor, state.fillOpacity / 100);
  applyShadow(context, state);
}

export function applyShadow(context: CanvasRenderingContext2D, state: EditorState): void {
  if (!state.shadowEnabled) {
    context.shadowBlur = 0;
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;
    return;
  }

  context.shadowColor = state.shadowColor;
  context.shadowBlur = state.shadowBlur;
  context.shadowOffsetX = state.shadowOffsetX;
  context.shadowOffsetY = state.shadowOffsetY;
}

function hexToRgba(hex: string, alpha: number): string {
  const normalized = hex.replace('#', '');
  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);

  return `rgb(${red} ${green} ${blue} / ${alpha})`;
}
