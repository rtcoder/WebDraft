import type {EditorServices, Point, SizeWithPosition, ClipboardSnapshot} from '../types';
import {getBounds, getClippedPasteBounds, normalizeCanvasBounds} from './editor-geometry';

export class SelectionController {
  private startPoint: Point | null = null;
  private _bounds: SizeWithPosition | null = null;
  private clipboard: ClipboardSnapshot | null = null;

  constructor(private readonly svc: EditorServices) {
  }

  get hasBounds(): boolean {
    return this._bounds !== null;
  }

  get bounds(): SizeWithPosition | null {
    return this._bounds;
  }

  get canPaste(): boolean {
    return this.clipboard !== null;
  }

  onPointerDown(point: Point): void {
    this.startPoint = point;
    this._bounds = null;
    this.svc.clearPreview();
  }

  onPointerMove(point: Point): void {
    if (!this.startPoint) return;
    this._bounds = getBounds(this.startPoint, point);
    this.renderFrame();
  }

  onPointerUp(point: Point): void {
    if (!this.startPoint) return;
    this._bounds = getBounds(this.startPoint, point);
    if (!normalizeCanvasBounds(this._bounds, this.canvasSize)) {
      this.clear();
      return;
    }
    this.renderFrame();
    this.svc.dispatchChange();
  }

  copy(): void {
    if (!this._bounds) return;
    const bounds = normalizeCanvasBounds(this._bounds, this.canvasSize);
    if (!bounds) return;
    const {context} = this.svc.layerManager.activeLayer;
    this.clipboard = {
      bounds,
      imageData: context.getImageData(bounds.x, bounds.y, bounds.width, bounds.height),
    };
    this.svc.dispatchChange();
  }

  cut(): void {
    if (!this._bounds) return;
    const bounds = normalizeCanvasBounds(this._bounds, this.canvasSize);
    if (!bounds) return;
    const before = this.svc.captureSnapshot();
    const {context} = this.svc.layerManager.activeLayer;
    this.clipboard = {
      bounds,
      imageData: context.getImageData(bounds.x, bounds.y, bounds.width, bounds.height),
    };
    context.clearRect(bounds.x, bounds.y, bounds.width, bounds.height);
    this.svc.pushHistory(before, this.svc.captureSnapshot());
    this.svc.dispatchChange();
  }

  paste(): void {
    if (!this.clipboard) return;
    const before = this.svc.captureSnapshot();
    const {context} = this.svc.layerManager.activeLayer;
    const target = this._bounds ?? this.clipboard.bounds;
    const pasteBounds = getClippedPasteBounds(target, this.clipboard.bounds, this.canvasSize);
    if (!pasteBounds) return;
    context.putImageData(
      this.clipboard.imageData,
      pasteBounds.targetX - pasteBounds.sourceX,
      pasteBounds.targetY - pasteBounds.sourceY,
      pasteBounds.sourceX,
      pasteBounds.sourceY,
      pasteBounds.width,
      pasteBounds.height,
    );
    this._bounds = {
      x: pasteBounds.targetX,
      y: pasteBounds.targetY,
      width: this.clipboard.bounds.width,
      height: this.clipboard.bounds.height,
    };
    this.renderFrame();
    this.svc.pushHistory(before, this.svc.captureSnapshot());
    this.svc.dispatchChange();
  }

  clear(): void {
    this.startPoint = null;
    this._bounds = null;
    this.svc.clearPreview();
  }

  private get canvasSize(): { width: number; height: number } {
    return {width: this.svc.state.canvasWidth, height: this.svc.state.canvasHeight};
  }

  private renderFrame(): void {
    if (!this._bounds) return;
    const bounds = normalizeCanvasBounds(this._bounds, this.canvasSize);
    if (!bounds) {
      this.svc.clearPreview();
      return;
    }
    this.svc.clearPreview();
    const ctx = this.svc.previewContext;
    ctx.save();
    ctx.setLineDash([6, 4]);
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#1b6cff';
    ctx.strokeRect(bounds.x + 0.5, bounds.y + 0.5, bounds.width, bounds.height);
    ctx.restore();
  }
}
