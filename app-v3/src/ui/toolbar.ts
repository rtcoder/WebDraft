import type {WebDraftEditor} from '../core/webdraft-editor';
import {bindKeyboardShortcuts} from './keyboard-shortcuts';
import {createLayersPanel} from './layers-panel';
import {
  createEditSection,
  createFileSection,
  createResizeSection,
  createShadowSection,
  createStyleSection,
  createTextSection,
  createToolSection,
  syncToolbarSections,
} from './toolbar-sections';
import {createToolbarSection} from './toolbar-controls';

export function createToolbar(editor: WebDraftEditor): HTMLElement {
  const toolbar = document.createElement('div');
  toolbar.className = 'toolbar';

  const title = document.createElement('h1');
  title.textContent = 'WebDraft';

  const fileInput = createFileInput(editor);
  const exportImage = async () => {
    const blob = await editor.exportPng();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'webdraft-image.png';
    link.click();
    URL.revokeObjectURL(url);
  };

  const sections = [
    createToolSection(editor),
    createStyleSection(editor),
    createShadowSection(editor),
    createTextSection(editor),
    createEditSection(editor),
    createResizeSection(editor),
    createFileSection(editor, fileInput, exportImage),
    {
      element: createToolbarSection(createLayersPanel(editor)),
      sync: () => {},
    },
  ];

  editor.addEventListener('change', () => syncToolbarSections(sections));
  syncToolbarSections(sections);

  toolbar.append(title, ...sections.map((section) => section.element));

  bindKeyboardShortcuts(editor, {
    openImagePicker: () => fileInput.click(),
    exportImage,
  });

  return toolbar;
}

function createFileInput(editor: WebDraftEditor): HTMLInputElement {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  fileInput.className = 'visually-hidden';
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files?.[0];

    if (!file) {
      return;
    }

    await editor.importImage(file);
    fileInput.value = '';
  });

  return fileInput;
}
