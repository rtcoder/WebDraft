import type {EditorState, Point, SizeWithPosition, TextLayerData} from './types';
import {Tool} from './types';

type StyledRun = {
  text: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  color: string;
  fontSize: number;
  fontFamily: string;
};

export function drawRichText(
  context: CanvasRenderingContext2D,
  textData: TextLayerData,
  drawBounds: SizeWithPosition,
): void {
  const htmlLines = parseHtmlToLines(textData.html, textData);

  context.save();
  context.globalCompositeOperation = 'source-over';
  context.textBaseline = 'top';

  let y = drawBounds.y;

  for (const htmlLine of htmlLines) {
    const displayLines = wrapRuns(context, htmlLine, drawBounds.width);
    for (const displayLine of displayLines) {
      if (y >= drawBounds.y + drawBounds.height) break;
      const lineH = maxFontSize(displayLine, textData.defaultFontSize) * 1.4;
      if (displayLine.length > 0) drawRichLine(context, displayLine, drawBounds, y, textData.defaultAlign);
      y += lineH;
    }
  }

  context.restore();
}

function wrapRuns(ctx: CanvasRenderingContext2D, runs: StyledRun[], maxWidth: number): StyledRun[][] {
  if (runs.length === 0) return [[]];

  const displayLines: StyledRun[][] = [[]];
  let lineWidth = 0;

  for (const run of runs) {
    const words = run.text.split(/(\s+)/);
    for (const word of words) {
      if (word === '') continue;
      const isSpace = /^\s+$/.test(word);
      ctx.font = runToFont(run);
      const w = ctx.measureText(word).width;

      if (!isSpace && lineWidth > 0 && lineWidth + w > maxWidth) {
        displayLines.push([]);
        lineWidth = 0;
      }
      if (isSpace && lineWidth === 0) continue;

      const currentLine = displayLines[displayLines.length - 1];
      const last = currentLine[currentLine.length - 1];
      if (last && sameStyle(last, run)) {
        last.text += word;
      } else {
        currentLine.push({ ...run, text: word });
      }
      lineWidth += w;
    }
  }

  return displayLines;
}

function sameStyle(a: StyledRun, b: StyledRun): boolean {
  return a.bold === b.bold && a.italic === b.italic && a.underline === b.underline &&
    a.color === b.color && a.fontSize === b.fontSize && a.fontFamily === b.fontFamily;
}

function maxFontSize(runs: StyledRun[], fallback: number): number {
  return runs.length === 0 ? fallback : Math.max(fallback, ...runs.map((r) => r.fontSize));
}

function drawRichLine(
  ctx: CanvasRenderingContext2D,
  runs: StyledRun[],
  bounds: SizeWithPosition,
  y: number,
  align: CanvasTextAlign,
): void {
  let totalWidth = 0;
  const widths: number[] = [];
  for (const run of runs) {
    ctx.font = runToFont(run);
    const w = ctx.measureText(run.text).width;
    widths.push(w);
    totalWidth += w;
  }

  let x: number;
  if (align === 'center') {
    x = bounds.x + (bounds.width - totalWidth) / 2;
  } else if (align === 'right' || align === 'end') {
    x = bounds.x + bounds.width - totalWidth;
  } else {
    x = bounds.x;
  }

  for (let i = 0; i < runs.length; i++) {
    const run = runs[i];
    ctx.font = runToFont(run);
    ctx.fillStyle = run.color;
    ctx.fillText(run.text, x, y);
    if (run.underline) {
      ctx.save();
      ctx.strokeStyle = run.color;
      ctx.lineWidth = Math.max(1, run.fontSize / 16);
      ctx.beginPath();
      ctx.moveTo(x, y + run.fontSize + 2);
      ctx.lineTo(x + widths[i], y + run.fontSize + 2);
      ctx.stroke();
      ctx.restore();
    }
    x += widths[i];
  }
}

function runToFont(run: StyledRun): string {
  return `${run.italic ? 'italic' : 'normal'} ${run.bold ? '700' : '400'} ${run.fontSize}px ${run.fontFamily}`;
}

function parseHtmlToLines(
  html: string,
  defaults: { defaultFontSize: number; defaultFontFamily: string; defaultColor: string },
): StyledRun[][] {
  const container = document.createElement('div');
  container.innerHTML = html;

  const allLines: StyledRun[][] = [[]];

  const currentLine = (): StyledRun[] => allLines[allLines.length - 1];
  const flush = (): void => { allLines.push([]); };

  type RunStyle = { bold: boolean; italic: boolean; underline: boolean; color: string; fontSize: number; fontFamily: string };

  function walk(node: Node, style: RunStyle): void {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent ?? '';
      if (text) currentLine().push({ text, ...style });
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;

    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();

    if (tag === 'br') { flush(); return; }

    const isBlock = tag === 'div' || tag === 'p';
    if (isBlock && currentLine().length > 0) flush();

    const next: RunStyle = { ...style };
    if (tag === 'b' || tag === 'strong') next.bold = true;
    if (tag === 'i' || tag === 'em') next.italic = true;
    if (tag === 'u') next.underline = true;

    const s = el.style;
    if (s) {
      if (['bold', '600', '700', '800', '900'].includes(s.fontWeight)) next.bold = true;
      if (s.fontStyle === 'italic') next.italic = true;
      const td = s.textDecorationLine || s.textDecoration;
      if (td?.includes('underline')) next.underline = true;
      if (s.color) next.color = s.color;
      const px = parseFloat(s.fontSize);
      if (px > 0) next.fontSize = px;
      if (s.fontFamily) next.fontFamily = s.fontFamily.replace(/['"]/g, '').trim();
    }

    for (const child of Array.from(el.childNodes)) walk(child, next);

    if (isBlock) flush();
  }

  const base: RunStyle = {
    bold: false, italic: false, underline: false,
    color: defaults.defaultColor,
    fontSize: defaults.defaultFontSize,
    fontFamily: defaults.defaultFontFamily,
  };

  for (const child of Array.from(container.childNodes)) walk(child, base);

  while (allLines.length > 1 && allLines[allLines.length - 1].length === 0) allLines.pop();

  return allLines;
}

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
