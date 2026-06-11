import type {LayerTranslations} from '../types.ts';

export const layerTranslations: LayerTranslations = {
  new: 'Nowa warstwa',
  delete: 'Usuń warstwę',
  moveUp: 'Przesuń warstwę w górę',
  moveDown: 'Przesuń warstwę w dół',
  addedOk: 'Warstwa dodana.',
  deletedOk: 'Warstwa usunięta.',
  resize: 'Zmień rozmiar warstwy\u2026',
  layerResizedOk: (w, h) => `Warstwa: ${w}\u00d7${h}`,
};
