import type {CameraTranslations} from '../types.ts';

export const cameraTranslations: CameraTranslations = {
  title: 'Kamera',
  titleWithLabel: (label) => `Kamera \u2014 ${label}`,
  unavailable: 'Kamera jest niedostępna w tej przeglądarce.',
  sepia: 'Sepia',
  noise: 'Szum',
  greyscale: 'Skala szarości',
  negative: 'Negatyw',
  snap: 'Zdjęcie',
  snapToCanvas: 'Zdjęcie na płótno',
  applyToCanvas: 'Zastosuj na płótno',
  saveToFile: 'Zapisz do pliku',
  backToLive: 'Wróć do podglądu',
  frameAdded: 'Kadr z kamery dodany.',
  cameraError: 'Błąd kamery.',
  snapFilename: 'camera-snap.png',
};
