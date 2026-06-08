import type {LayerSnapshot, LayerSummary} from './layer-manager';
import {LayerManager} from './layer-manager';
import {EditorOptions, EditorState, Point, SizeWithPosition, Tool} from './types';

export class WebDraftEditor extends EventTarget {
  private readonly root: HTMLElement;
  private readonly options: EditorOptions;
  private readonly layerManager: LayerManager;
  private readonly previewCanvas: HTMLCanvasElement;
  private readonly previewContext: CanvasRenderingContext2D;
  private readonly eventLayer: HTMLDivElement;
  private isDrawing = false;
  private lastPoint: Point | null = null;
  private shapeStartPoint: Point | null = null;
  private pendingHistorySnapshot: LayerSnapshot | null = null;
  private readonly undoStack: HistoryEntry[] = [];
  private readonly redoStack: HistoryEntry[] = [];

  readonly state: EditorState;

  constructor(root: HTMLElement, options: EditorOptions) {
    super();

    this.root = root;
    this.options = options;
    this.layerManager = new LayerManager(root);
    this.previewCanvas = document.createElement('canvas');
    this.previewCanvas.className = 'shape-preview-layer';
    this.eventLayer = document.createElement('div');
    this.eventLayer.className = 'event-layer';

    const previewContext = this.previewCanvas.getContext('2d');

    if (!previewContext) {
      throw new Error('Canvas 2D context is unavailable.');
    }

    this.previewContext = previewContext;

    this.state = {
      activeTool: Tool.Pencil,
      color: options.color,
      size: options.size,
    };
  }

  mount(): void {
    this.root.style.setProperty('--canvas-width', `${this.options.width}px`);
    this.root.style.setProperty('--canvas-height', `${this.options.height}px`);
    this.previewCanvas.width = this.options.width;
    this.previewCanvas.height = this.options.height;
    this.layerManager.createLayer(this.options.width, this.options.height);
    this.root.append(this.previewCanvas);
    this.root.append(this.eventLayer);
    this.bindPointerEvents();
    this.dispatchChange();
  }

  get layers(): LayerSummary[] {
    return this.layerManager.summaries;
  }

  get canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  get canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  setTool(tool: Tool): void {
    this.state.activeTool = tool;
    this.dispatchChange();
  }

  setColor(color: string): void {
    this.state.color = color;
    this.dispatchChange();
  }

  setSize(size: number): void {
    this.state.size = Math.min(Math.max(size, 1), 120);
    this.dispatchChange();
  }

  clear(): void {
    const before = this.layerManager.captureActiveLayer();
    this.layerManager.clearActiveLayer();
    this.pushHistory(before, this.layerManager.captureActiveLayer());
  }

  undo(): void {
    const entry = this.undoStack.pop();

    if (!entry) {
      return;
    }

    this.layerManager.restoreLayer(entry.before);
    this.redoStack.push(entry);
    this.dispatchChange();
  }

  redo(): void {
    const entry = this.redoStack.pop();

    if (!entry) {
      return;
    }

    this.layerManager.restoreLayer(entry.after);
    this.undoStack.push(entry);
    this.dispatchChange();
  }

  async importImage(file: File): Promise<void> {
    const image = await this.loadImage(file);
    const target = this.fitImage(image);

    this.layerManager.drawImageOnNewLayer(image, this.options.width, this.options.height, target);
    this.dispatchChange();
  }

  async exportPng(): Promise<Blob> {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Canvas 2D context is unavailable.');
    }

    canvas.width = this.options.width;
    canvas.height = this.options.height;

    for (const layer of this.layerManager.visibleLayers) {
      context.drawImage(layer.canvas, 0, 0);
    }

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/png');
    });

    if (!blob) {
      throw new Error('Unable to export PNG.');
    }

    return blob;
  }

  addLayer(): void {
    this.layerManager.createLayer(this.options.width, this.options.height);
    this.dispatchChange();
  }

  deleteActiveLayer(): void {
    this.layerManager.deleteActiveLayer();
    this.dispatchChange();
  }

  selectLayer(id: string): void {
    this.layerManager.selectLayer(id);
    this.dispatchChange();
  }

  toggleLayerVisibility(id: string): void {
    this.layerManager.toggleVisibility(id);
    this.dispatchChange();
  }

  moveActiveLayerUp(): void {
    if (this.layerManager.moveActiveLayerUp()) {
      this.dispatchChange();
    }
  }

  moveActiveLayerDown(): void {
    if (this.layerManager.moveActiveLayerDown()) {
      this.dispatchChange();
    }
  }

  private bindPointerEvents(): void {
    this.eventLayer.addEventListener('pointerdown', (event) => {
      this.eventLayer.setPointerCapture(event.pointerId);
      this.isDrawing = true;
      this.lastPoint = this.getPoint(event);
      this.pendingHistorySnapshot = this.layerManager.captureActiveLayer();

      if (this.isShapeTool()) {
        this.shapeStartPoint = this.lastPoint;
        return;
      }

      this.drawPoint(this.lastPoint);
    });

    this.eventLayer.addEventListener('pointermove', (event) => {
      if (!this.isDrawing || !this.lastPoint) {
        return;
      }

      const nextPoint = this.getPoint(event);

      if (this.isShapeTool()) {
        this.renderShapePreview(nextPoint);
        return;
      }

      this.drawLine(this.lastPoint, nextPoint);
      this.lastPoint = nextPoint;
    });

    this.eventLayer.addEventListener('pointerup', (event) => {
      if (this.isShapeTool()) {
        this.commitShape(this.getPoint(event));
      }

      this.commitPendingHistory();
      this.eventLayer.releasePointerCapture(event.pointerId);
      this.isDrawing = false;
      this.lastPoint = null;
      this.shapeStartPoint = null;
    });

    this.eventLayer.addEventListener('pointercancel', () => {
      this.isDrawing = false;
      this.lastPoint = null;
      this.shapeStartPoint = null;
      this.pendingHistorySnapshot = null;
      this.clearShapePreview();
    });
  }

  private getPoint(event: PointerEvent): Point {
    const rect = this.eventLayer.getBoundingClientRect();

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  private async loadImage(file: File): Promise<HTMLImageElement> {
    const url = URL.createObjectURL(file);
    const image = new Image();

    try {
      await new Promise<void>((resolve, reject) => {
        image.addEventListener('load', () => resolve(), {once: true});
        image.addEventListener('error', () => reject(new Error('Unable to load image.')), {once: true});
        image.src = url;
      });

      return image;
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  private fitImage(image: HTMLImageElement): SizeWithPosition {
    const ratio = Math.min(this.options.width / image.naturalWidth, this.options.height / image.naturalHeight, 1);
    const width = image.naturalWidth * ratio;
    const height = image.naturalHeight * ratio;

    return {
      x: (this.options.width - width) / 2,
      y: (this.options.height - height) / 2,
      width,
      height,
    };
  }

  private isShapeTool(): boolean {
    return this.state.activeTool === Tool.Rectangle || this.state.activeTool === Tool.Ellipse;
  }

  private renderShapePreview(point: Point): void {
    if (!this.shapeStartPoint) {
      return;
    }

    this.clearShapePreview();
    this.drawShape(this.previewContext, this.getBounds(this.shapeStartPoint, point));
  }

  private commitShape(point: Point): void {
    if (!this.shapeStartPoint) {
      return;
    }

    const {context} = this.layerManager.activeLayer;
    this.drawShape(context, this.getBounds(this.shapeStartPoint, point));
    this.clearShapePreview();
  }

  private clearShapePreview(): void {
    this.previewContext.clearRect(0, 0, this.previewCanvas.width, this.previewCanvas.height);
  }

  private getBounds(start: Point, end: Point): SizeWithPosition {
    const x = Math.min(start.x, end.x);
    const y = Math.min(start.y, end.y);
    const width = Math.abs(end.x - start.x);
    const height = Math.abs(end.y - start.y);

    return {x, y, width, height};
  }

  private drawShape(context: CanvasRenderingContext2D, bounds: SizeWithPosition): void {
    if (bounds.width < 1 || bounds.height < 1) {
      return;
    }

    this.applyStroke(context);
    context.beginPath();

    if (this.state.activeTool === Tool.Rectangle) {
      context.rect(bounds.x, bounds.y, bounds.width, bounds.height);
    }

    if (this.state.activeTool === Tool.Ellipse) {
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

    context.stroke();
  }

  private drawPoint(point: Point): void {
    const {context} = this.layerManager.activeLayer;
    this.applyBrush(context);

    context.beginPath();
    context.arc(point.x, point.y, this.state.size / 2, 0, Math.PI * 2);
    context.fill();
  }

  private drawLine(start: Point, end: Point): void {
    const {context} = this.layerManager.activeLayer;
    this.applyBrush(context);

    context.beginPath();
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    context.stroke();
  }

  private applyBrush(context: CanvasRenderingContext2D): void {
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.lineWidth = this.state.size;

    if (this.state.activeTool === Tool.Eraser) {
      context.globalCompositeOperation = 'destination-out';
      context.strokeStyle = '#000000';
      context.fillStyle = '#000000';
      return;
    }

    context.globalCompositeOperation = 'source-over';
    context.strokeStyle = this.state.color;
    context.fillStyle = this.state.color;
  }

  private applyStroke(context: CanvasRenderingContext2D): void {
    context.globalCompositeOperation = 'source-over';
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.lineWidth = this.state.size;
    context.strokeStyle = this.state.color;
    context.fillStyle = this.state.color;
  }

  private commitPendingHistory(): void {
    if (!this.pendingHistorySnapshot) {
      return;
    }

    this.pushHistory(this.pendingHistorySnapshot, this.layerManager.captureActiveLayer());
    this.pendingHistorySnapshot = null;
  }

  private pushHistory(before: LayerSnapshot, after: LayerSnapshot): void {
    this.undoStack.push({before, after});
    this.redoStack.length = 0;
    this.dispatchChange();
  }

  private dispatchChange(): void {
    this.dispatchEvent(new CustomEvent('change', {detail: this.state}));
  }
}

type HistoryEntry = {
  before: LayerSnapshot;
  after: LayerSnapshot;
};
