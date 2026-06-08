import {SizeWithPosition} from './types.ts';

export type Layer = {
  id: string;
  name: string;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  visible: boolean;
};

export type LayerSummary = {
  id: string;
  name: string;
  active: boolean;
  preview: string;
  visible: boolean;
};

export type LayerSnapshot = {
  layerId: string;
  imageData: ImageData;
};

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
        visible: layer.visible
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

    const layer: Layer = {
      id,
      name: `Layer ${this.layerCount + 1}`,
      canvas,
      context,
      visible: true
    };

    this.layerCount += 1;
    this.layers.push(layer);
    this.activeLayerId = layer.id;
    this.root.append(canvas);

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
    }
  }

  captureActiveLayer(): LayerSnapshot {
    const layer = this.activeLayer;

    return {
      layerId: layer.id,
      imageData: layer.context.getImageData(0, 0, layer.canvas.width, layer.canvas.height),
    };
  }

  restoreLayer(snapshot: LayerSnapshot): void {
    const layer = this.assertLayer(snapshot.layerId);

    layer.context.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
    layer.context.putImageData(snapshot.imageData, 0, 0);
    this.activeLayerId = layer.id;
  }

  drawImageOnNewLayer(
    image: CanvasImageSource,
    width: number,
    height: number,
    target: SizeWithPosition
  ): Layer {
    const layer = this.createLayer(width, height);
    layer.context.drawImage(image, target.x, target.y, target.width, target.height);

    return layer;
  }

  selectLayer(id: string): void {
    this.assertLayer(id);
    this.activeLayerId = id;
  }

  renameLayer(id: string, name: string): void {
    const layer = this.assertLayer(id);
    const nextName = name.trim();

    if (nextName) {
      layer.name = nextName;
    }
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
