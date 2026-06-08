export type Layer = {
  id: string;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  visible: boolean;
};

export class LayerManager {
  private readonly root: HTMLElement;
  private readonly layers: Layer[] = [];
  private activeLayerId = '';

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

  createLayer(width: number, height: number): Layer {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Canvas 2D context is unavailable.');
    }

    canvas.width = width;
    canvas.height = height;
    canvas.className = 'drawing-layer';

    const layer: Layer = {
      id: crypto.randomUUID(),
      canvas,
      context,
      visible: true
    };

    this.layers.push(layer);
    this.activeLayerId = layer.id;
    this.root.append(canvas);

    return layer;
  }

  clearActiveLayer(): void {
    const layer = this.activeLayer;
    layer.context.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
  }
}
