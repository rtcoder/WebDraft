import type {Layer, LayerDocumentSnapshot, LayerSummary, SizeWithPosition} from '../types';
import {t} from './i18n.ts';


export class LayerManager {
  private readonly root: HTMLElement;
  private readonly layers: Layer[] = [];
  private activeLayerId = '';
  private layerCount = 0;

  constructor(root: HTMLElement) {
    this.root = root;
  }

  get activeLayer(): Layer {
    const layer = this.layers.find((item) => item.id === this.activeLayerId);

    if (!layer) {
      throw new Error('No active drawing layer.');
    }

    return layer;
  }

  get count(): number {
    return this.layers.length;
  }

  get summaries(): LayerSummary[] {
    return this.layers
      .map((layer) => ({
        id: layer.id,
        name: layer.name,
        active: layer.id === this.activeLayerId,
        preview: layer.canvas.toDataURL('image/png'),
        visible: layer.visible,
        isTextLayer: !!layer.textData,
      }))
      .reverse();
  }

  get visibleLayers(): Layer[] {
    return this.layers.filter((layer) => layer.visible);
  }

  get allLayers(): Layer[] {
    return [...this.layers];
  }

  createLayer(width: number, height: number): Layer {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Canvas 2D context is unavailable.');
    }

    canvas.width = width;
    canvas.height = height;
    const id = crypto.randomUUID();

    canvas.className = 'drawing-layer';
    canvas.dataset.layerId = id;

    const name = t.layers.layerName(`${this.layerCount + 1}`);

    const layer: Layer = {
      id,
      name,
      canvas,
      context,
      visible: true,
      x: 0,
      y: 0,
    };

    this.layerCount += 1;
    this.layers.push(layer);
    this.activeLayerId = layer.id;
    this.root.append(canvas);
    this.syncLayerStyle(layer);
    this.updateActiveLayerClass();

    return layer;
  }

  clearActiveLayer(): void {
    const layer = this.activeLayer;
    layer.context.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
  }

  resizeLayers(width: number, height: number): void {
    for (const layer of this.layers) {
      const source = document.createElement('canvas');
      const sourceContext = source.getContext('2d');

      if (!sourceContext) {
        throw new Error('Canvas 2D context is unavailable.');
      }

      source.width = layer.canvas.width;
      source.height = layer.canvas.height;
      sourceContext.drawImage(layer.canvas, 0, 0);
      layer.canvas.width = width;
      layer.canvas.height = height;
      layer.context.clearRect(0, 0, width, height);
      layer.context.drawImage(source, 0, 0);
      layer.x = 0;
      layer.y = 0;
      this.syncLayerStyle(layer);
    }
  }

  captureDocument(): LayerDocumentSnapshot {
    return {
      activeLayerId: this.activeLayerId,
      layerCount: this.layerCount,
      layers: this.layers.map((layer) => ({
        layerId: layer.id,
        name: layer.name,
        visible: layer.visible,
        x: layer.x,
        y: layer.y,
        textData: layer.textData,
        imageData: layer.context.getImageData(0, 0, layer.canvas.width, layer.canvas.height),
      })),
    };
  }

  restoreDocument(snapshot: LayerDocumentSnapshot): void {
    for (const layer of this.layers) {
      layer.canvas.remove();
    }

    this.layers.length = 0;
    this.layerCount = snapshot.layerCount;

    for (const layerSnapshot of snapshot.layers) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Canvas 2D context is unavailable.');
      }

      canvas.width = layerSnapshot.imageData.width;
      canvas.height = layerSnapshot.imageData.height;
      canvas.className = 'drawing-layer';
      canvas.dataset.layerId = layerSnapshot.layerId;
      canvas.hidden = !layerSnapshot.visible;
      context.putImageData(layerSnapshot.imageData, 0, 0);

      const layer: Layer = {
        id: layerSnapshot.layerId,
        name: layerSnapshot.name,
        canvas,
        context,
        visible: layerSnapshot.visible,
        x: layerSnapshot.x ?? 0,
        y: layerSnapshot.y ?? 0,
        textData: layerSnapshot.textData,
      };
      this.syncLayerStyle(layer);
      this.layers.push(layer);
      this.root.append(canvas);
    }

    this.activeLayerId = snapshot.layers.some((layer) => layer.layerId === snapshot.activeLayerId)
      ? snapshot.activeLayerId
      : this.layers[0]?.id ?? '';
    this.updateActiveLayerClass();
  }

  drawImageOnNewLayer(
    image: CanvasImageSource,
    width: number,
    height: number,
    target: SizeWithPosition,
  ): Layer {
    const layer = this.createLayer(width, height);
    layer.context.drawImage(image, target.x, target.y, target.width, target.height);

    return layer;
  }

  selectLayer(id: string): void {
    this.assertLayer(id);
    this.activeLayerId = id;
    this.updateActiveLayerClass();
  }

  renameLayer(id: string, name: string): boolean {
    const layer = this.assertLayer(id);
    const nextName = name.trim();

    if (!nextName || nextName === layer.name) {
      return false;
    }

    layer.name = nextName;
    return true;
  }

  deleteActiveLayer(): Layer | null {
    if (this.layers.length <= 1) {
      return null;
    }

    const index = this.getActiveIndex();
    const [removedLayer] = this.layers.splice(index, 1);
    removedLayer.canvas.remove();

    const nextLayer = this.layers[index] ?? this.layers[index - 1];
    this.activeLayerId = nextLayer.id;
    this.updateActiveLayerClass();

    return removedLayer;
  }

  toggleVisibility(id: string): void {
    const layer = this.assertLayer(id);
    layer.visible = !layer.visible;
    layer.canvas.hidden = !layer.visible;

    if (!layer.visible && layer.id === this.activeLayerId) {
      const nextVisibleLayer = [...this.layers].reverse().find((item) => item.visible);
      if (nextVisibleLayer) {
        this.activeLayerId = nextVisibleLayer.id;
        this.updateActiveLayerClass();
      }
    }
  }

  moveActiveLayerUp(): boolean {
    const index = this.getActiveIndex();

    if (index === this.layers.length - 1) {
      return false;
    }

    this.swapLayers(index, index + 1);
    return true;
  }

  moveActiveLayerDown(): boolean {
    const index = this.getActiveIndex();

    if (index === 0) {
      return false;
    }

    this.swapLayers(index, index - 1);
    return true;
  }

  private getActiveIndex(): number {
    const index = this.layers.findIndex((layer) => layer.id === this.activeLayerId);

    if (index < 0) {
      throw new Error('No active drawing layer.');
    }

    return index;
  }

  private assertLayer(id: string): Layer {
    const layer = this.layers.find((item) => item.id === id);

    if (!layer) {
      throw new Error(`Unknown layer: ${id}`);
    }

    return layer;
  }

  syncActiveLayerStyle(): void {
    this.syncLayerStyle(this.activeLayer);
  }

  private syncLayerStyle(layer: Layer): void {
    layer.canvas.style.left = `${layer.x}px`;
    layer.canvas.style.top = `${layer.y}px`;
    layer.canvas.style.width = `${layer.canvas.width}px`;
    layer.canvas.style.height = `${layer.canvas.height}px`;
  }

  private updateActiveLayerClass(): void {
    for (const layer of this.layers) {
      layer.canvas.classList.toggle('drawing-layer--active', layer.id === this.activeLayerId);
    }
  }

  private swapLayers(firstIndex: number, secondIndex: number): void {
    const firstLayer = this.layers[firstIndex];
    const secondLayer = this.layers[secondIndex];

    this.layers[firstIndex] = secondLayer;
    this.layers[secondIndex] = firstLayer;
    this.renderLayerOrder();
  }

  private renderLayerOrder(): void {
    for (const layer of this.layers) {
      this.root.append(layer.canvas);
    }
  }
}
