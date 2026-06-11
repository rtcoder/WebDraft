import type {ImageTranslations} from '../../types/i18n';

export const imageTranslations: ImageTranslations = {
  resizeCanvas: 'Zmień rozmiar płótna\u2026',
  invertColors: 'Odwróć kolory',
  mirrorH: 'Lustro poziome',
  mirrorV: 'Lustro pionowe',
  rotateLeft: 'Obróć w lewo',
  rotateRight: 'Obróć w prawo',
  widthPrompt: 'Szerokość (px):',
  heightPrompt: 'Wysokość (px):',
  resizedOk: (w, h) => `Płótno: ${w}\u00d7${h}`,
  applyToAllLayers: 'Zastosuj do wszystkich warstw',
};
