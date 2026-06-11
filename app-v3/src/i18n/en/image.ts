import type {ImageTranslations} from '../types.ts';

export const imageTranslations: ImageTranslations = {
  resizeCanvas: 'Resize Canvas\u2026',
  invertColors: 'Invert Colors',
  mirrorH: 'Mirror Horizontal',
  mirrorV: 'Mirror Vertical',
  rotateLeft: 'Rotate Left',
  rotateRight: 'Rotate Right',
  widthPrompt: 'Width (px):',
  heightPrompt: 'Height (px):',
  resizedOk: (w, h) => `Canvas: ${w}\u00d7${h}`,
  applyToAllLayers: 'Apply to all layers',
};
