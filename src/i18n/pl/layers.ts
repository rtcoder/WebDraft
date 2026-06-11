import type {LayersTranslations} from '../../types/i18n';

export const layersTranslations: LayersTranslations = {
  title: 'Warstwy',
  addLayer: 'Dodaj warstwę',
  deleteLayer: 'Usuń warstwę',
  layerName: (suffix) => `Warstwa ${suffix}`,
  moveLayerUp: 'Przesuń warstwę w górę',
  moveLayerDown: 'Przesuń warstwę w dół',
  selectLayer: (name) => `Zaznacz ${name}`,
  renameLayer: 'Zmień nazwę warstwy',
  hideLayer: 'Ukryj warstwę',
  showLayer: 'Pokaż warstwę',
  textLayer: 'Warstwa tekstowa',
};
