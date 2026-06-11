export type PixelBuffer = {
  width: number;
  height: number;
  data: Uint8ClampedArray;
};

export type RotationDirection = 'left' | 'right';
export type MirrorAxis = 'horizontal' | 'vertical';
