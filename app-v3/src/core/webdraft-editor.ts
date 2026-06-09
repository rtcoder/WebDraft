import type {LayerDocumentSnapshot, LayerSummary} from './layer-manager';
import {WDRAFT_MIME_TYPE, WDRAFT_VERSION, type WdraftFile, type WdraftLayer} from './project-file';
import {
  drawLine,
  drawPoint,
  drawShape,
  drawText,
  drawWebLine,
  getCanvasFont,
} from './canvas-drawing';
import {
  fitNaturalSizeToCanvas,
  getClippedPasteBounds,
  getBounds,
  normalizeCanvasBounds,
  normalizeTextBounds,
} from './editor-geometry';
import {floodFillImageData, hexToRgbaColor} from './flood-fill';
import {HistoryManager} from './history-manager';
import {LayerManager} from './layer-manager';
import {invertPixelBuffer, mirrorPixelBuffer, rotatePixelBuffer} from './layer-transforms';
import {EditorOptions, EditorState, Point, SizeWithPosition, Tool} from './types';

export class WebDraftEditor extends EventTarget {
  private readonly root: HTMLElement;
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
  private pendingHistorySnapshot: HistorySnapshot | null = null;
  private readonly history = new HistoryManager<HistorySnapshot>(30);

  readonly state: EditorState;

  constructor(root: HTMLElement, options: EditorOptions) {
    super();

    this.root = root;
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
      fillOpacity: 100,
      fillTolerance: 0,
      size: options.size,
      canvasWidth: options.width,
      canvasHeight: options.height,
      webSensitivity: 100,
      shadowEnabled: false,
      shadowColor: '#000000',
      shadowBlur: 8,
      shadowOffsetX: 8,
      shadowOffsetY: 8,
      textFontFamily: 'sans-serif',
      textAlign: 'left',
      textBold: false,
      textItalic: false,
    };
  }

  mount(): void {
    this.applyCanvasSize();
    this.layerManager.createLayer(this.state.canvasWidth, this.state.canvasHeight);
    this.root.append(this.previewCanvas);
    this.root.append(this.eventLayer);
    this.bindPointerEvents();
    this.dispatchChange();
  }

  get layers(): LayerSummary[] {
    return this.layerManager.summaries;
  }

  get canUndo(): boolean {
    return this.history.canUndo;
  }

  get canRedo(): boolean {
    return this.history.canRedo;
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

  setFillOpacity(opacity: number): void {
    this.state.fillOpacity = Math.min(Math.max(opacity, 0), 100);
    this.dispatchChange();
  }

  setFillTolerance(tolerance: number): void {
    this.state.fillTolerance = Math.min(Math.max(tolerance, 0), 255);
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

  setShadowEnabled(enabled: boolean): void {
    this.state.shadowEnabled = enabled;
    this.dispatchChange();
  }

  setShadowColor(color: string): void {
    this.state.shadowColor = color;
    this.dispatchChange();
  }

  setShadowBlur(blur: number): void {
    this.state.shadowBlur = Math.min(Math.max(blur, 0), 80);
    this.dispatchChange();
  }

  setShadowOffsetX(offset: number): void {
    this.state.shadowOffsetX = Math.min(Math.max(offset, -120), 120);
    this.dispatchChange();
  }

  setShadowOffsetY(offset: number): void {
    this.state.shadowOffsetY = Math.min(Math.max(offset, -120), 120);
    this.dispatchChange();
  }

  setTextFontFamily(fontFamily: string): void {
    this.state.textFontFamily = fontFamily;
    this.dispatchChange();
  }

  setTextAlign(align: CanvasTextAlign): void {
    this.state.textAlign = align;
    this.dispatchChange();
  }

  setTextBold(enabled: boolean): void {
    this.state.textBold = enabled;
    this.dispatchChange();
  }

  setTextItalic(enabled: boolean): void {
    this.state.textItalic = enabled;
    this.dispatchChange();
  }

  resizeCanvas(width: number, height: number): void {
    this.commitTextInput();
    this.clearSelection();

    const nextWidth = Math.min(Math.max(Math.round(width), 64), 4096);
    const nextHeight = Math.min(Math.max(Math.round(height), 64), 4096);

    if (nextWidth === this.state.canvasWidth && nextHeight === this.state.canvasHeight) {
      return;
    }

    const before = this.captureHistorySnapshot();
    this.state.canvasWidth = nextWidth;
    this.state.canvasHeight = nextHeight;
    this.layerManager.resizeLayers(nextWidth, nextHeight);
    this.applyCanvasSize();
    this.clipboard = null;
    this.pushHistory(before, this.captureHistorySnapshot());
  }

  clear(): void {
    const before = this.captureHistorySnapshot();
    this.layerManager.clearActiveLayer();
    this.pushHistory(before, this.captureHistorySnapshot());
  }

  undo(): void {
    const snapshot = this.history.undo();

    if (!snapshot) {
      return;
    }

    this.restoreHistorySnapshot(snapshot);
    this.dispatchChange();
  }

  redo(): void {
    const snapshot = this.history.redo();

    if (!snapshot) {
      return;
    }

    this.restoreHistorySnapshot(snapshot);
    this.dispatchChange();
  }

  async importImage(file: File): Promise<void> {
    const before = this.captureHistorySnapshot();
    const image = await this.loadImage(file);
    const target = fitNaturalSizeToCanvas(image, this.canvasSize);

    this.layerManager.drawImageOnNewLayer(image, this.state.canvasWidth, this.state.canvasHeight, target);
    this.pushHistory(before, this.captureHistorySnapshot());
  }

  async importCameraFrame(): Promise<void> {
    const mediaDevices = navigator.mediaDevices;

    if (!mediaDevices?.getUserMedia) {
      throw new Error('Camera is unavailable in this browser.');
    }

    const stream = await mediaDevices.getUserMedia({video: true});
    const video = document.createElement('video');

    try {
      video.muted = true;
      video.playsInline = true;
      video.srcObject = stream;
      await video.play();

      await new Promise<void>((resolve) => {
        if (video.videoWidth > 0 && video.videoHeight > 0) {
          resolve();
          return;
        }

        video.addEventListener('loadedmetadata', () => resolve(), {once: true});
      });

      const before = this.captureHistorySnapshot();
      const target = fitNaturalSizeToCanvas({naturalWidth: video.videoWidth, naturalHeight: video.videoHeight}, this.canvasSize);
      this.layerManager.drawImageOnNewLayer(video, this.state.canvasWidth, this.state.canvasHeight, target);
      this.pushHistory(before, this.captureHistorySnapshot());
    } finally {
      stream.getTracks().forEach((track) => track.stop());
    }
  }

  importCanvasAsLayer(source: HTMLCanvasElement): void {
    const before = this.captureHistorySnapshot();
    const target = fitNaturalSizeToCanvas(
      {naturalWidth: source.width, naturalHeight: source.height},
      this.canvasSize,
    );
    this.layerManager.drawImageOnNewLayer(source, this.state.canvasWidth, this.state.canvasHeight, target);
    this.pushHistory(before, this.captureHistorySnapshot());
    this.dispatchChange();
  }

  async exportProject(): Promise<Blob> {
    const snapshot = this.layerManager.captureDocument();
    const layers: WdraftLayer[] = snapshot.layers.map((layer) => {
      const canvas = document.createElement('canvas');
      canvas.width = layer.imageData.width;
      canvas.height = layer.imageData.height;
      canvas.getContext('2d')!.putImageData(layer.imageData, 0, 0);
      return {
        id: layer.layerId,
        name: layer.name,
        visible: layer.visible,
        width: layer.imageData.width,
        height: layer.imageData.height,
        imageDataUrl: canvas.toDataURL('image/png'),
      };
    });
    const file: WdraftFile = {
      version: WDRAFT_VERSION,
      canvasWidth: this.state.canvasWidth,
      canvasHeight: this.state.canvasHeight,
      activeLayerId: snapshot.activeLayerId,
      layerCount: snapshot.layerCount,
      layers,
    };
    return new Blob([JSON.stringify(file)], {type: WDRAFT_MIME_TYPE});
  }

  async importProject(file: WdraftFile): Promise<void> {
    const before = this.captureHistorySnapshot();
    const imageDataList = await Promise.all(
      file.layers.map((l) => loadDataUrlAsImageData(l.imageDataUrl, l.width, l.height)),
    );
    const newDocument = {
      activeLayerId: file.activeLayerId,
      layerCount: file.layerCount,
      layers: file.layers.map((l, i) => ({
        layerId: l.id,
        name: l.name,
        visible: l.visible,
        imageData: imageDataList[i],
      })),
    };
    this.state.canvasWidth = file.canvasWidth;
    this.state.canvasHeight = file.canvasHeight;
    this.layerManager.restoreDocument(newDocument);
    this.applyCanvasSize();
    this.clearSelection();
    this.pushHistory(before, this.captureHistorySnapshot());
    this.dispatchChange();
  }

  async exportPng(): Promise<Blob> {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Canvas 2D context is unavailable.');
    }

    canvas.width = this.state.canvasWidth;
    canvas.height = this.state.canvasHeight;

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
    const before = this.captureHistorySnapshot();
    this.layerManager.createLayer(this.state.canvasWidth, this.state.canvasHeight);
    this.pushHistory(before, this.captureHistorySnapshot());
  }

  deleteActiveLayer(): void {
    const before = this.captureHistorySnapshot();
    if (this.layerManager.deleteActiveLayer()) {
      this.pushHistory(before, this.captureHistorySnapshot());
    }
  }

  selectLayer(id: string): void {
    this.layerManager.selectLayer(id);
    this.dispatchChange();
  }

  renameLayer(id: string, name: string): void {
    const before = this.captureHistorySnapshot();
    if (this.layerManager.renameLayer(id, name)) {
      this.pushHistory(before, this.captureHistorySnapshot());
    }
  }

  toggleLayerVisibility(id: string): void {
    const before = this.captureHistorySnapshot();
    this.layerManager.toggleVisibility(id);
    this.pushHistory(before, this.captureHistorySnapshot());
  }

  moveActiveLayerUp(): void {
    const before = this.captureHistorySnapshot();
    if (this.layerManager.moveActiveLayerUp()) {
      this.pushHistory(before, this.captureHistorySnapshot());
    }
  }

  moveActiveLayerDown(): void {
    const before = this.captureHistorySnapshot();
    if (this.layerManager.moveActiveLayerDown()) {
      this.pushHistory(before, this.captureHistorySnapshot());
    }
  }

  copySelection(): void {
    if (!this.selectionBounds) {
      return;
    }

    const bounds = normalizeCanvasBounds(this.selectionBounds, this.canvasSize);

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

    const bounds = normalizeCanvasBounds(this.selectionBounds, this.canvasSize);

    if (!bounds) {
      return;
    }

    const before = this.captureHistorySnapshot();
    const {context} = this.layerManager.activeLayer;

    this.clipboard = {
      bounds,
      imageData: context.getImageData(bounds.x, bounds.y, bounds.width, bounds.height),
    };
    context.clearRect(bounds.x, bounds.y, bounds.width, bounds.height);
    this.pushHistory(before, this.captureHistorySnapshot());
    this.dispatchChange();
  }

  pasteSelection(): void {
    if (!this.clipboard) {
      return;
    }

    const before = this.captureHistorySnapshot();
    const {context} = this.layerManager.activeLayer;
    const target = this.selectionBounds ?? this.clipboard.bounds;
    const pasteBounds = getClippedPasteBounds(target, this.clipboard.bounds, this.canvasSize);

    if (!pasteBounds) {
      return;
    }

    context.putImageData(
      this.clipboard.imageData,
      pasteBounds.targetX - pasteBounds.sourceX,
      pasteBounds.targetY - pasteBounds.sourceY,
      pasteBounds.sourceX,
      pasteBounds.sourceY,
      pasteBounds.width,
      pasteBounds.height,
    );
    this.selectionBounds = {
      x: pasteBounds.targetX,
      y: pasteBounds.targetY,
      width: this.clipboard.bounds.width,
      height: this.clipboard.bounds.height,
    };
    this.renderSelectionFrame();
    this.pushHistory(before, this.captureHistorySnapshot());
    this.dispatchChange();
  }

  invertActiveLayer(): void {
    this.commitTextInput();
    this.clearSelection();

    const before = this.captureHistorySnapshot();
    const {canvas, context} = this.layerManager.activeLayer;
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const transformed = invertPixelBuffer(imageData);

    context.putImageData(createImageData(transformed), 0, 0);
    this.pushHistory(before, this.captureHistorySnapshot());
  }

  rotateActiveLayer(direction: 'left' | 'right'): void {
    this.commitTextInput();
    this.clearSelection();

    const before = this.captureHistorySnapshot();
    const {canvas, context} = this.layerManager.activeLayer;
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const transformed = rotatePixelBuffer(imageData, direction);

    context.putImageData(createImageData(transformed), 0, 0);
    this.pushHistory(before, this.captureHistorySnapshot());
  }

  mirrorActiveLayer(axis: 'horizontal' | 'vertical'): void {
    this.commitTextInput();
    this.clearSelection();

    const before = this.captureHistorySnapshot();
    const {canvas, context} = this.layerManager.activeLayer;
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const transformed = mirrorPixelBuffer(imageData, axis);

    context.putImageData(createImageData(transformed), 0, 0);
    this.pushHistory(before, this.captureHistorySnapshot());
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

      if (this.state.activeTool === Tool.FillBucket) {
        this.fillActiveLayer(this.lastPoint);
        this.isDrawing = false;
        this.lastPoint = null;
        return;
      }

      this.pendingHistorySnapshot = this.captureHistorySnapshot();

      if (this.isShapeTool()) {
        this.shapeStartPoint = this.lastPoint;
        return;
      }

      if (this.state.activeTool === Tool.Web) {
        this.webPoints = [this.lastPoint];
        drawPoint(this.layerManager.activeLayer.context, this.lastPoint, this.state);
        return;
      }

      drawPoint(this.layerManager.activeLayer.context, this.lastPoint, this.state);
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
        this.webPoints = drawWebLine(this.layerManager.activeLayer.context, nextPoint, this.webPoints, this.state);
        this.lastPoint = nextPoint;
        return;
      }

      drawLine(this.layerManager.activeLayer.context, this.lastPoint, nextPoint, this.state);
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

  private applyCanvasSize(): void {
    this.root.style.setProperty('--canvas-width', `${this.state.canvasWidth}px`);
    this.root.style.setProperty('--canvas-height', `${this.state.canvasHeight}px`);
    this.previewCanvas.width = this.state.canvasWidth;
    this.previewCanvas.height = this.state.canvasHeight;
  }

  private get canvasSize(): {width: number; height: number} {
    return {
      width: this.state.canvasWidth,
      height: this.state.canvasHeight,
    };
  }

  private isShapeTool(): boolean {
    return this.state.activeTool === Tool.Rectangle || this.state.activeTool === Tool.Ellipse;
  }

  private sampleColor(point: Point): void {
    const x = Math.floor(point.x);
    const y = Math.floor(point.y);

    if (x < 0 || y < 0 || x >= this.state.canvasWidth || y >= this.state.canvasHeight) {
      return;
    }

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Canvas 2D context is unavailable.');
    }

    canvas.width = this.state.canvasWidth;
    canvas.height = this.state.canvasHeight;

    for (const layer of this.layerManager.visibleLayers) {
      context.drawImage(layer.canvas, 0, 0);
    }

    const [red, green, blue, alpha] = context.getImageData(x, y, 1, 1).data;

    if (alpha === 0) {
      return;
    }

    this.setColor(rgbToHex(red, green, blue));
  }

  private fillActiveLayer(point: Point): void {
    const before = this.captureHistorySnapshot();
    const {canvas, context} = this.layerManager.activeLayer;
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const changed = floodFillImageData(
      imageData,
      point.x,
      point.y,
      hexToRgbaColor(this.state.fillColor, this.state.fillOpacity / 100),
      this.state.fillTolerance,
    );

    if (!changed) {
      return;
    }

    context.putImageData(imageData, 0, 0);
    this.pushHistory(before, this.captureHistorySnapshot());
  }

  private renderSelectionPreview(point: Point): void {
    if (!this.selectionStartPoint) {
      return;
    }

    this.selectionBounds = getBounds(this.selectionStartPoint, point);
    this.renderSelectionFrame();
  }

  private commitSelection(point: Point): void {
    if (!this.selectionStartPoint) {
      return;
    }

    this.selectionBounds = getBounds(this.selectionStartPoint, point);

    if (!normalizeCanvasBounds(this.selectionBounds, this.canvasSize)) {
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

    this.textBounds = getBounds(this.textStartPoint, point);
    this.renderTextFrame();
  }

  private showTextInput(point: Point): void {
    if (!this.textStartPoint) {
      return;
    }

    const bounds = normalizeTextBounds(getBounds(this.textStartPoint, point), this.canvasSize);

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
    input.style.font = getCanvasFont(this.state);
    input.style.fontWeight = this.state.textBold ? '700' : '400';
    input.style.fontStyle = this.state.textItalic ? 'italic' : 'normal';
    input.style.textAlign = this.state.textAlign;
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

    const before = this.captureHistorySnapshot();
    const {context} = this.layerManager.activeLayer;

    drawText(context, value, bounds, this.state);
    this.pushHistory(before, this.captureHistorySnapshot());
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

    const bounds = normalizeTextBounds(this.textBounds, this.canvasSize);

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

    const bounds = normalizeCanvasBounds(this.selectionBounds, this.canvasSize);

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
    drawShape(this.previewContext, getBounds(this.shapeStartPoint, point), this.state);
  }

  private commitShape(point: Point): void {
    if (!this.shapeStartPoint) {
      return;
    }

    const {context} = this.layerManager.activeLayer;
    drawShape(context, getBounds(this.shapeStartPoint, point), this.state);
    this.clearPreview();
  }

  private clearPreview(): void {
    this.previewContext.clearRect(0, 0, this.previewCanvas.width, this.previewCanvas.height);
  }

  private commitPendingHistory(): void {
    if (!this.pendingHistorySnapshot) {
      return;
    }

    this.pushHistory(this.pendingHistorySnapshot, this.captureHistorySnapshot());
    this.pendingHistorySnapshot = null;
  }

  private captureHistorySnapshot(): HistorySnapshot {
    return {
      canvasWidth: this.state.canvasWidth,
      canvasHeight: this.state.canvasHeight,
      document: this.layerManager.captureDocument(),
    };
  }

  private restoreHistorySnapshot(snapshot: HistorySnapshot): void {
    this.state.canvasWidth = snapshot.canvasWidth;
    this.state.canvasHeight = snapshot.canvasHeight;
    this.layerManager.restoreDocument(snapshot.document);
    this.applyCanvasSize();
    this.clearSelection();
  }

  private pushHistory(before: HistorySnapshot, after: HistorySnapshot): void {
    this.history.push(before, after);
    this.dispatchChange();
  }

  private dispatchChange(): void {
    this.dispatchEvent(new CustomEvent('change', {detail: this.state}));
  }
}

type HistorySnapshot = {
  canvasWidth: number;
  canvasHeight: number;
  document: LayerDocumentSnapshot;
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

function createImageData(buffer: {data: Uint8ClampedArray; width: number; height: number}): ImageData {
  const data = new Uint8ClampedArray(buffer.data.length);
  data.set(buffer.data);

  return new ImageData(data, buffer.width, buffer.height);
}

function loadDataUrlAsImageData(dataUrl: string, width: number, height: number): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      resolve(ctx.getImageData(0, 0, width, height));
    };
    img.onerror = () => reject(new Error('Failed to load layer image.'));
    img.src = dataUrl;
  });
}
