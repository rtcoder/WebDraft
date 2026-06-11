import type {LayerTranslations} from '../../types/i18n';

export const layerTranslations: LayerTranslations = {
  new: 'New Layer',
  delete: 'Delete Layer',
  moveUp: 'Move Layer Up',
  moveDown: 'Move Layer Down',
  addedOk: 'Layer added.',
  deletedOk: 'Layer deleted.',
  resize: 'Resize Layer\u2026',
  layerResizedOk: (w, h) => `Layer: ${w}\u00d7${h}`,
};
