import type {CameraTranslations} from '../types.ts';

export const cameraTranslations: CameraTranslations = {
  title: 'Camera',
  titleWithLabel: (label) => `Camera \u2014 ${label}`,
  unavailable: 'Camera is unavailable in this browser.',
  sepia: 'Sepia',
  noise: 'Noise',
  greyscale: 'Greyscale',
  negative: 'Negative',
  snap: 'Snap',
  snapToCanvas: 'Snap to canvas',
  applyToCanvas: 'Apply to canvas',
  saveToFile: 'Save to file',
  backToLive: 'Back to live',
  frameAdded: 'Camera frame added.',
  cameraError: 'Camera error.',
  snapFilename: 'camera-snap.png',
};
