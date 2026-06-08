import { LayerManager } from './layer-manager';
import type { EditorOptions, EditorState, Point, ToolId } from './types';

export class WebDraftEditor extends EventTarget {
  private readonly root: HTMLElement;
  private readonly options: EditorOptions;
  private readonly layerManager: LayerManager;
  private readonly eventLayer: HTMLDivElement;
  private isDrawing = false;
  private lastPoint: Point | null = null;

  readonly state: EditorState;

  constructor(root: HTMLElement, options: EditorOptions) {
    super();

    this.root = root;
    this.options = options;
    this.layerManager = new LayerManager(root);
    this.eventLayer = document.createElement('div');
    this.eventLayer.className = 'event-layer';

    this.state = {
      activeTool: 'pencil',
      color: options.color,
      size: options.size
    };
  }

  mount(): void {
    this.root.style.setProperty('--canvas-width', `${this.options.width}px`);
    this.root.style.setProperty('--canvas-height', `${this.options.height}px`);
    this.layerManager.createLayer(this.options.width, this.options.height);
    this.root.append(this.eventLayer);
    this.bindPointerEvents();
  }

  setTool(tool: ToolId): void {
    this.state.activeTool = tool;
    this.dispatchChange();
  }

  setColor(color: string): void {
    this.state.color = color;
    this.dispatchChange();
  }

  setSize(size: number): void {
    this.state.size = size;
    this.dispatchChange();
  }

  clear(): void {
    this.layerManager.clearActiveLayer();
  }

  private bindPointerEvents(): void {
    this.eventLayer.addEventListener('pointerdown', (event) => {
      this.eventLayer.setPointerCapture(event.pointerId);
      this.isDrawing = true;
      this.lastPoint = this.getPoint(event);
      this.drawPoint(this.lastPoint);
    });

    this.eventLayer.addEventListener('pointermove', (event) => {
      if (!this.isDrawing || !this.lastPoint) {
        return;
      }

      const nextPoint = this.getPoint(event);
      this.drawLine(this.lastPoint, nextPoint);
      this.lastPoint = nextPoint;
    });

    this.eventLayer.addEventListener('pointerup', (event) => {
      this.eventLayer.releasePointerCapture(event.pointerId);
      this.isDrawing = false;
      this.lastPoint = null;
    });

    this.eventLayer.addEventListener('pointercancel', () => {
      this.isDrawing = false;
      this.lastPoint = null;
    });
  }

  private getPoint(event: PointerEvent): Point {
    const rect = this.eventLayer.getBoundingClientRect();

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  private drawPoint(point: Point): void {
    const { context } = this.layerManager.activeLayer;
    this.applyBrush(context);

    context.beginPath();
    context.arc(point.x, point.y, this.state.size / 2, 0, Math.PI * 2);
    context.fill();
  }

  private drawLine(start: Point, end: Point): void {
    const { context } = this.layerManager.activeLayer;
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

    if (this.state.activeTool === 'eraser') {
      context.globalCompositeOperation = 'destination-out';
      context.strokeStyle = '#000000';
      context.fillStyle = '#000000';
      return;
    }

    context.globalCompositeOperation = 'source-over';
    context.strokeStyle = this.state.color;
    context.fillStyle = this.state.color;
  }

  private dispatchChange(): void {
    this.dispatchEvent(new CustomEvent('change', { detail: this.state }));
  }
}
