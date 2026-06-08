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
  private selectionStartPoint: Point | null = null;
  private selectionBounds: SizeWithPosition | null = null;
  private textStartPoint: Point | null = null;
  private textBounds: SizeWithPosition | null = null;
  private textInput: HTMLTextAreaElement | null = null;
  private skipNextTextPointerDown = false;
  private webPoints: Point[] = [];
  private clipboard: ClipboardSnapshot | null = null;
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
      fillColor: '#ffffff',
      fillEnabled: false,
      size: options.size,
      webSensitivity: 100,
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

  get hasSelection(): boolean {
    return this.selectionBounds !== null;
  }

  get canPaste(): boolean {
    return this.clipboard !== null;
  }

  setTool(tool: Tool): void {
    this.commitTextInput();
    this.state.activeTool = tool;
    if (tool !== Tool.Select) {
      this.clearSelection();
    }
    this.dispatchChange();
  }

  setColor(color: string): void {
    this.state.color = color;
    this.dispatchChange();
  }

  setFillColor(color: string): void {
    this.state.fillColor = color;
    this.dispatchChange();
  }

  setFillEnabled(enabled: boolean): void {
    this.state.fillEnabled = enabled;
    this.dispatchChange();
  }

  setSize(size: number): void {
    this.state.size = Math.min(Math.max(size, 1), 120);
    this.dispatchChange();
  }

  setWebSensitivity(sensitivity: number): void {
    this.state.webSensitivity = Math.min(Math.max(sensitivity, 20), 260);
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

  copySelection(): void {
    if (!this.selectionBounds) {
      return;
    }

    const bounds = this.normalizeCanvasBounds(this.selectionBounds);

    if (!bounds) {
      return;
    }

    const {context} = this.layerManager.activeLayer;

    this.clipboard = {
      bounds,
      imageData: context.getImageData(bounds.x, bounds.y, bounds.width, bounds.height),
    };
    this.dispatchChange();
  }

  cutSelection(): void {
    if (!this.selectionBounds) {
      return;
    }

    const bounds = this.normalizeCanvasBounds(this.selectionBounds);

    if (!bounds) {
      return;
    }

    const before = this.layerManager.captureActiveLayer();
    const {context} = this.layerManager.activeLayer;

    this.clipboard = {
      bounds,
      imageData: context.getImageData(bounds.x, bounds.y, bounds.width, bounds.height),
    };
    context.clearRect(bounds.x, bounds.y, bounds.width, bounds.height);
    this.pushHistory(before, this.layerManager.captureActiveLayer());
    this.dispatchChange();
  }

  pasteSelection(): void {
    if (!this.clipboard) {
      return;
    }

    const before = this.layerManager.captureActiveLayer();
    const {context} = this.layerManager.activeLayer;
    const target = this.selectionBounds ?? this.clipboard.bounds;
    const x = Math.round(target.x);
    const y = Math.round(target.y);

    context.putImageData(this.clipboard.imageData, x, y);
    this.selectionBounds = {
      x,
      y,
      width: this.clipboard.bounds.width,
      height: this.clipboard.bounds.height,
    };
    this.renderSelectionFrame();
    this.pushHistory(before, this.layerManager.captureActiveLayer());
    this.dispatchChange();
  }

  private bindPointerEvents(): void {
    this.eventLayer.addEventListener('pointerdown', (event) => {
      this.eventLayer.setPointerCapture(event.pointerId);
      this.isDrawing = true;
      this.lastPoint = this.getPoint(event);

      if (this.state.activeTool === Tool.Select) {
        this.selectionStartPoint = this.lastPoint;
        this.selectionBounds = null;
        this.clearPreview();
        return;
      }

      if (this.state.activeTool === Tool.Text) {
        if (this.textInput) {
          this.commitTextInput();
          this.isDrawing = false;
          this.lastPoint = null;
          return;
        }

        if (this.skipNextTextPointerDown) {
          this.skipNextTextPointerDown = false;
          this.isDrawing = false;
          this.lastPoint = null;
          return;
        }

        this.commitTextInput();
        this.textStartPoint = this.lastPoint;
        this.textBounds = null;
        this.clearPreview();
        return;
      }

      if (this.state.activeTool === Tool.Sampler) {
        this.sampleColor(this.lastPoint);
        this.setTool(Tool.Pencil);
        this.isDrawing = false;
        this.lastPoint = null;
        return;
      }

      this.pendingHistorySnapshot = this.layerManager.captureActiveLayer();

      if (this.isShapeTool()) {
        this.shapeStartPoint = this.lastPoint;
        return;
      }

      if (this.state.activeTool === Tool.Web) {
        this.webPoints = [this.lastPoint];
        this.drawPoint(this.lastPoint);
        return;
      }

      this.drawPoint(this.lastPoint);
    });

    this.eventLayer.addEventListener('pointermove', (event) => {
      if (!this.isDrawing || !this.lastPoint) {
        return;
      }

      const nextPoint = this.getPoint(event);

      if (this.state.activeTool === Tool.Select) {
        this.renderSelectionPreview(nextPoint);
        return;
      }

      if (this.state.activeTool === Tool.Text) {
        this.renderTextPreview(nextPoint);
        return;
      }

      if (this.isShapeTool()) {
        this.renderShapePreview(nextPoint);
        return;
      }

      if (this.state.activeTool === Tool.Web) {
        this.drawWebLine(nextPoint);
        this.lastPoint = nextPoint;
        return;
      }

      this.drawLine(this.lastPoint, nextPoint);
      this.lastPoint = nextPoint;
    });

    this.eventLayer.addEventListener('pointerup', (event) => {
      if (this.state.activeTool === Tool.Select) {
        this.commitSelection(this.getPoint(event));
      }

      if (this.state.activeTool === Tool.Text) {
        this.showTextInput(this.getPoint(event));
      }

      if (this.isShapeTool()) {
        this.commitShape(this.getPoint(event));
      }

      if (this.state.activeTool !== Tool.Select && this.state.activeTool !== Tool.Text) {
        this.commitPendingHistory();
      }
      this.eventLayer.releasePointerCapture(event.pointerId);
      this.isDrawing = false;
      this.lastPoint = null;
      this.shapeStartPoint = null;
      this.selectionStartPoint = null;
      this.webPoints = [];
    });

    this.eventLayer.addEventListener('pointercancel', () => {
      this.isDrawing = false;
      this.lastPoint = null;
      this.shapeStartPoint = null;
      this.selectionStartPoint = null;
      this.textStartPoint = null;
      this.webPoints = [];
      this.pendingHistorySnapshot = null;
      this.clearPreview();
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

  private sampleColor(point: Point): void {
    const x = Math.floor(point.x);
    const y = Math.floor(point.y);

    if (x < 0 || y < 0 || x >= this.options.width || y >= this.options.height) {
      return;
    }

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

    const [red, green, blue, alpha] = context.getImageData(x, y, 1, 1).data;

    if (alpha === 0) {
      return;
    }

    this.setColor(rgbToHex(red, green, blue));
  }

  private renderSelectionPreview(point: Point): void {
    if (!this.selectionStartPoint) {
      return;
    }

    this.selectionBounds = this.getBounds(this.selectionStartPoint, point);
    this.renderSelectionFrame();
  }

  private commitSelection(point: Point): void {
    if (!this.selectionStartPoint) {
      return;
    }

    this.selectionBounds = this.getBounds(this.selectionStartPoint, point);

    if (!this.normalizeCanvasBounds(this.selectionBounds)) {
      this.clearSelection();
      return;
    }

    this.renderSelectionFrame();
    this.dispatchChange();
  }

  private renderTextPreview(point: Point): void {
    if (!this.textStartPoint) {
      return;
    }

    this.textBounds = this.getBounds(this.textStartPoint, point);
    this.renderTextFrame();
  }

  private showTextInput(point: Point): void {
    if (!this.textStartPoint) {
      return;
    }

    const bounds = this.normalizeTextBounds(this.getBounds(this.textStartPoint, point));

    this.textBounds = bounds;
    this.clearPreview();
    this.createTextInput(bounds);
    this.textStartPoint = null;
  }

  private createTextInput(bounds: SizeWithPosition): void {
    this.removeTextInput();

    const input = document.createElement('textarea');
    input.className = 'text-input-layer';
    input.style.left = `${bounds.x}px`;
    input.style.top = `${bounds.y}px`;
    input.style.width = `${bounds.width}px`;
    input.style.height = `${bounds.height}px`;
    input.style.color = this.state.color;
    input.style.font = this.getCanvasFont();
    input.placeholder = 'Text';

    input.addEventListener('keydown', (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault();
        this.commitTextInput();
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        this.removeTextInput();
        this.clearPreview();
      }
    });

    input.addEventListener('blur', () => {
      this.commitTextInput({skipNextPointerDown: true});
    });

    this.textInput = input;
    this.root.append(input);
    input.focus();
  }

  private commitTextInput(options: {skipNextPointerDown?: boolean} = {}): void {
    if (!this.textInput || !this.textBounds) {
      return;
    }

    const value = this.textInput.value.trimEnd();
    const bounds = this.textBounds;

    this.removeTextInput();
    this.clearPreview();
    this.skipNextTextPointerDown = options.skipNextPointerDown ?? false;

    if (!value.trim()) {
      this.textBounds = null;
      return;
    }

    const before = this.layerManager.captureActiveLayer();
    const {context} = this.layerManager.activeLayer;

    this.drawText(context, value, bounds);
    this.pushHistory(before, this.layerManager.captureActiveLayer());
    this.textBounds = null;
  }

  private removeTextInput(): void {
    this.textInput?.remove();
    this.textInput = null;
  }

  private renderTextFrame(): void {
    if (!this.textBounds) {
      return;
    }

    const bounds = this.normalizeTextBounds(this.textBounds);

    this.clearPreview();
    this.previewContext.save();
    this.previewContext.setLineDash([4, 4]);
    this.previewContext.lineWidth = 1;
    this.previewContext.strokeStyle = '#6b9dff';
    this.previewContext.strokeRect(bounds.x + 0.5, bounds.y + 0.5, bounds.width, bounds.height);
    this.previewContext.restore();
  }

  private clearSelection(): void {
    this.selectionStartPoint = null;
    this.selectionBounds = null;
    this.clearPreview();
  }

  private renderSelectionFrame(): void {
    if (!this.selectionBounds) {
      return;
    }

    const bounds = this.normalizeCanvasBounds(this.selectionBounds);

    if (!bounds) {
      this.clearPreview();
      return;
    }

    this.clearPreview();
    this.previewContext.save();
    this.previewContext.setLineDash([6, 4]);
    this.previewContext.lineWidth = 1;
    this.previewContext.strokeStyle = '#1b6cff';
    this.previewContext.strokeRect(bounds.x + 0.5, bounds.y + 0.5, bounds.width, bounds.height);
    this.previewContext.restore();
  }

  private renderShapePreview(point: Point): void {
    if (!this.shapeStartPoint) {
      return;
    }

    this.clearPreview();
    this.drawShape(this.previewContext, this.getBounds(this.shapeStartPoint, point));
  }

  private commitShape(point: Point): void {
    if (!this.shapeStartPoint) {
      return;
    }

    const {context} = this.layerManager.activeLayer;
    this.drawShape(context, this.getBounds(this.shapeStartPoint, point));
    this.clearPreview();
  }

  private clearPreview(): void {
    this.previewContext.clearRect(0, 0, this.previewCanvas.width, this.previewCanvas.height);
  }

  private getBounds(start: Point, end: Point): SizeWithPosition {
    const x = Math.min(start.x, end.x);
    const y = Math.min(start.y, end.y);
    const width = Math.abs(end.x - start.x);
    const height = Math.abs(end.y - start.y);

    return {x, y, width, height};
  }

  private normalizeCanvasBounds(bounds: SizeWithPosition): SizeWithPosition | null {
    const x = Math.max(0, Math.round(bounds.x));
    const y = Math.max(0, Math.round(bounds.y));
    const right = Math.min(this.options.width, Math.round(bounds.x + bounds.width));
    const bottom = Math.min(this.options.height, Math.round(bounds.y + bounds.height));
    const width = right - x;
    const height = bottom - y;

    if (width < 1 || height < 1) {
      return null;
    }

    return {x, y, width, height};
  }

  private normalizeTextBounds(bounds: SizeWithPosition): SizeWithPosition {
    const x = Math.max(0, Math.round(bounds.x));
    const y = Math.max(0, Math.round(bounds.y));
    const width = Math.max(160, Math.min(this.options.width - x, Math.round(bounds.width)));
    const height = Math.max(48, Math.min(this.options.height - y, Math.round(bounds.height)));

    return {x, y, width, height};
  }

  private drawText(context: CanvasRenderingContext2D, value: string, bounds: SizeWithPosition): void {
    context.save();
    context.globalCompositeOperation = 'source-over';
    context.fillStyle = this.state.color;
    context.font = this.getCanvasFont();
    context.textAlign = 'left';
    context.textBaseline = 'top';

    const fontSize = this.getTextFontSize();
    const lineHeight = fontSize * 1.25;
    const lines = value.split('\n');

    lines.forEach((line, index) => {
      const y = bounds.y + index * lineHeight;

      if (y + lineHeight <= bounds.y + bounds.height) {
        context.fillText(line, bounds.x, y, bounds.width);
      }
    });

    context.restore();
  }

  private getCanvasFont(): string {
    return `${this.getTextFontSize()}px sans-serif`;
  }

  private getTextFontSize(): number {
    return Math.max(8, this.state.size * 2);
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

    if (this.state.fillEnabled) {
      context.fill();
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

  private drawWebLine(point: Point): void {
    const {context} = this.layerManager.activeLayer;
    const previousPoint = this.webPoints[this.webPoints.length - 1];

    if (!previousPoint) {
      this.webPoints.push(point);
      return;
    }

    this.applyBrush(context);
    context.beginPath();
    context.moveTo(previousPoint.x, previousPoint.y);
    context.lineTo(point.x, point.y);
    context.stroke();

    const sensitivitySquared = this.state.webSensitivity * this.state.webSensitivity;

    for (const pastPoint of this.webPoints) {
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

    this.webPoints.push(point);
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
    context.fillStyle = this.state.fillColor;
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

type ClipboardSnapshot = {
  bounds: SizeWithPosition;
  imageData: ImageData;
};

function rgbToHex(red: number, green: number, blue: number): string {
  return `#${toHex(red)}${toHex(green)}${toHex(blue)}`;
}

function toHex(value: number): string {
  return value.toString(16).padStart(2, '0');
}
