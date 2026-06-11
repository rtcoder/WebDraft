import type {Translations} from '../../types/i18n';
import {cameraTranslations} from './camera.ts';
import {commonTranslations} from './common.ts';
import {editTranslations} from './edit.ts';
import {fileTranslations} from './file.ts';
import {imageTranslations} from './image.ts';
import {layerTranslations} from './layer.ts';
import {layersTranslations} from './layers.ts';
import {menuTranslations} from './menu.ts';
import {pickerTranslations} from './picker.ts';
import {saveDialogTranslations} from './saveDialog.ts';
import {toolbarTranslations} from './toolbar.ts';

export const en: Translations = {
  menu: menuTranslations,
  file: fileTranslations,
  edit: editTranslations,
  image: imageTranslations,
  layer: layerTranslations,
  toolbar: toolbarTranslations,
  layers: layersTranslations,
  camera: cameraTranslations,
  picker: pickerTranslations,
  common: commonTranslations,
  saveDialog: saveDialogTranslations,
};
