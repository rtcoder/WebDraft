import type {Layer} from './layer-manager';
import {drawRichText} from './rich-text-renderer';
import {createTextToolbar, type TextToolbarDefaults} from '../ui/text-toolbar';
import {getBounds, normalizeTextBounds} from './editor-geometry';
import type {EditorServices} from './editor-context';
import type {Point, SizeWithPosition} from './types';

export class TextEditController {
  private startPoint: Point | null = null;
  private _bounds: SizeWithPosition | null = null;
  private inputEl: HTMLElement | null = null;
  private toolbarEl: HTMLElement | null = null;
  private toolbarCleanup: (() => void) | null = null;
  private inputDefaults: TextToolbarDefaults | null = null;
  private skipNextPointerDown = false;
  private pendingLayerEdit: Layer | null = null;
  private editingLayer: Layer | null = null;
  private editSnapshot: ImageData | null = null;

  constructor(private readonly svc: EditorServices) {}

  get isActive(): boolean {
    return this.inputEl !== null;
  }

  /**
   * Returns true if the pointer down was fully handled (caller should not start a draw stroke).
   */
  onPointerDown(point: Point): boolean {
    if (this.inputEl) {
      this.commit();
      return true;
    }

    const textLayerAtPoint = this.findTextLayerAt(point);

    if (this.skipNextPointerDown) {
      this.skipNextPointerDown = false;
      if (!textLayerAtPoint) return true;
    }

    this.commit();

    if (textLayerAtPoint) {
      this.pendingLayerEdit = textLayerAtPoint;
      return true;
    }

    this.startPoint = point;
    this._bounds = null;
    this.svc.clearPreview();
    return false;
  }

  onPointerMove(point: Point): void {
    if (!this.startPoint) return;
    this._bounds = getBounds(this.startPoint, point);
    this.renderFrame();
  }

  onPointerUp(point: Point): void {
    if (this.pendingLayerEdit) {
      this.enterEditMode(this.pendingLayerEdit);
      this.pendingLayerEdit = null;
      return;
    }
    if (!this.startPoint) return;
    const bounds = normalizeTextBounds(
      getBounds(this.startPoint, point),
      this.canvasSize,
    );
    this._bounds = bounds;
    this.svc.clearPreview();
    this.createInput(bounds, {
      fontSize: 16,
      fontFamily: 'sans-serif',
      color: this.svc.state.color,
      align: 'left',
    });
    this.startPoint = null;
  }

  commit(options: {skipNextPointerDown?: boolean} = {}): void {
    if (!this.inputEl || !this._bounds) return;

    const html = this.inputEl.innerHTML;
    const bounds = this._bounds;
    const editingLayer = this.editingLayer;
    const snapshot = this.editSnapshot;
    const defaults = this.inputDefaults ?? {
      fontSize: 16,
      fontFamily: 'sans-serif',
      color: '#000000',
      align: 'left' as CanvasTextAlign,
    };

    this.removeInput();
    this.svc.clearPreview();
    this.skipNextPointerDown = options.skipNextPointerDown ?? false;
    this._bounds = null;
    this.editingLayer = null;
    this.editSnapshot = null;

    const plainText = htmlToPlainText(html);
    if (!plainText.trim()) {
      if (editingLayer && snapshot) editingLayer.context.putImageData(snapshot, 0, 0);
      return;
    }

    const textData = {
      html,
      bounds,
      defaultFontSize: defaults.fontSize,
      defaultFontFamily: defaults.fontFamily,
      defaultColor: defaults.color,
      defaultAlign: defaults.align,
    };

    const before = this.svc.captureSnapshot();

    if (editingLayer) {
      const {context, x: lx, y: ly} = editingLayer;
      drawRichText(context, textData, {
        x: bounds.x - lx,
        y: bounds.y - ly,
        width: bounds.width,
        height: bounds.height,
      });
      editingLayer.textData = textData;
      editingLayer.name = `T: ${plainText.slice(0, 18)}`;
    } else {
      const newLayer = this.svc.layerManager.createLayer(
        this.svc.state.canvasWidth,
        this.svc.state.canvasHeight,
      );
      drawRichText(newLayer.context, textData, bounds);
      newLayer.textData = textData;
      newLayer.name = `T: ${plainText.slice(0, 18)}`;
    }

    this.svc.pushHistory(before, this.svc.captureSnapshot());
    this.svc.dispatchChange();
  }

  private enterEditMode(layer: Layer): void {
    if (!layer.textData) return;
    if (layer.id !== this.svc.layerManager.activeLayer.id) {
      this.svc.layerManager.selectLayer(layer.id);
      this.svc.dispatchChange();
    }
    this.editSnapshot = layer.context.getImageData(0, 0, layer.canvas.width, layer.canvas.height);
    layer.context.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
    this._bounds = layer.textData.bounds;
    this.editingLayer = layer;
    this.createInput(layer.textData.bounds, {
      fontSize: layer.textData.defaultFontSize,
      fontFamily: layer.textData.defaultFontFamily,
      color: layer.textData.defaultColor,
      align: layer.textData.defaultAlign,
    });
    if (this.inputEl) {
      this.inputEl.innerHTML = layer.textData.html;
    }
  }

  private findTextLayerAt(point: Point): Layer | null {
    const layers = this.svc.layerManager.allLayers;
    for (let i = layers.length - 1; i >= 0; i--) {
      const layer = layers[i];
      if (!layer.visible) continue;
      if (layer.textData) {
        const b = layer.textData.bounds;
        if (
          point.x >= b.x &&
          point.x < b.x + b.width &&
          point.y >= b.y &&
          point.y < b.y + b.height
        ) {
          return layer;
        }
      }
      const lx = Math.floor(point.x - layer.x);
      const ly = Math.floor(point.y - layer.y);
      if (lx >= 0 && ly >= 0 && lx < layer.canvas.width && ly < layer.canvas.height) {
        if (layer.context.getImageData(lx, ly, 1, 1).data[3] > 10) {
          return null;
        }
      }
    }
    return null;
  }

  private createInput(bounds: SizeWithPosition, defaults: TextToolbarDefaults): void {
    this.removeInput();

    const input = document.createElement('div');
    input.className = 'text-input-layer';
    input.contentEditable = 'true';
    input.style.left = `${bounds.x}px`;
    input.style.top = `${bounds.y}px`;
    input.style.width = `${bounds.width}px`;
    input.style.height = `${bounds.height}px`;
    input.style.color = defaults.color;
    input.style.fontSize = `${defaults.fontSize}px`;
    input.style.fontFamily = defaults.fontFamily;
    input.style.textAlign = defaults.align;

    input.addEventListener('keydown', (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault();
        this.commit();
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        const cancelLayer = this.editingLayer;
        const cancelSnapshot = this.editSnapshot;
        this.editingLayer = null;
        this.editSnapshot = null;
        this._bounds = null;
        if (cancelLayer && cancelSnapshot) {
          cancelLayer.context.putImageData(cancelSnapshot, 0, 0);
        }
        this.removeInput();
        this.svc.clearPreview();
      }
    });

    input.addEventListener('blur', (event) => {
      const related = (event as FocusEvent).relatedTarget as Node | null;
      if (this.toolbarEl?.contains(related)) return;
      this.commit({skipNextPointerDown: true});
    });

    this.inputEl = input;
    this.inputDefaults = defaults;

    const {element: toolbar, cleanup} = createTextToolbar(input, bounds, defaults, (align) => {
      if (this.inputDefaults) this.inputDefaults.align = align;
    });
    this.toolbarEl = toolbar;
    this.toolbarCleanup = cleanup;

    this.svc.root.append(input);
    this.svc.root.append(toolbar);
    input.focus();
  }

  private removeInput(): void {
    this.toolbarCleanup?.();
    this.toolbarCleanup = null;
    this.toolbarEl?.remove();
    this.toolbarEl = null;
    this.inputEl?.remove();
    this.inputEl = null;
    this.inputDefaults = null;
  }

  private renderFrame(): void {
    if (!this._bounds) return;
    const bounds = normalizeTextBounds(this._bounds, this.canvasSize);
    this.svc.clearPreview();
    const ctx = this.svc.previewContext;
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#6b9dff';
    ctx.strokeRect(bounds.x + 0.5, bounds.y + 0.5, bounds.width, bounds.height);
    ctx.restore();
  }

  private get canvasSize(): {width: number; height: number} {
    return {width: this.svc.state.canvasWidth, height: this.svc.state.canvasHeight};
  }
}

function htmlToPlainText(html: string): string {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent ?? '';
}
