export class Layer {
  id?: string;
  width!: number;
  height!: number;
  offsetLeft!: number;
  offsetTop!: number;
  data!: ImageData;
  visible!: boolean;
  active!: boolean;
  zIndex!:number;

  constructor(data?: Layer) {
    Object.assign(this, data);
    if (!this.id) {
      this.id = Layer.generateId()
    }
  }

  private static generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}
