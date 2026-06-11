import {parseWdraftBinary} from '../core/project-file';
import {t} from '../core/i18n';
import type {WebDraftEditor} from '../core/webdraft-editor';
import {StatusReporter} from '../types';
import {bindKeyboardShortcuts} from './keyboard-shortcuts';
import {openSaveDialog} from './save-dialog';
import {openShortcutsDialog} from './shortcuts-dialog';
import {getErrorMessage} from './status-toasts';
import {
  createFileSection,
  createShadowSection,
  createStyleSection,
  createToolSection,
  syncToolbarSections,
} from './toolbar-sections';

export function createToolbar(editor: WebDraftEditor, status: StatusReporter): HTMLElement {
  const toolbar = document.createElement('div');
  toolbar.className = 'toolbar';

  const title = document.createElement('h1');
  title.textContent = 'WebDraft';

  const fileInput = createFileInput(editor, status);
  const exportImage = async () => {
    try {
      const blob = await editor.exportPng();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = t.file.imageFilename;
      link.click();
      URL.revokeObjectURL(url);
      status.show(t.toolbar.pngExportedOk, 'success');
    } catch (error) {
      status.show(getErrorMessage(error), 'error');
    }
  };

  const sections = [
    createToolSection(editor),
    createStyleSection(editor),
    createShadowSection(editor),
    createFileSection(editor, status),
  ];

  editor.addEventListener('change', () => syncToolbarSections(sections));
  syncToolbarSections(sections);

  toolbar.append(title, fileInput, ...sections.map((section) => section.element));

  const saveProject = async () => {
    try {
      const blob = await editor.exportProject();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = t.file.projectFilename;
      link.click();
      URL.revokeObjectURL(url);
      status.show(t.file.savedOk, 'success');
    } catch (error) {
      status.show(getErrorMessage(error), 'error');
    }
  };

  bindKeyboardShortcuts(editor, {
    openImagePicker: () => fileInput.click(),
    exportImage,
    onSave: () => openSaveDialog((action) => {
      if (action === 'png') void exportImage();
      else void saveProject();
    }),
    openShortcutsDialog,
  });

  return toolbar;
}

function createFileInput(editor: WebDraftEditor, status: StatusReporter): HTMLInputElement {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*,.wdraft';
  fileInput.className = 'visually-hidden';
  fileInput.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    void (async () => {
      try {
        if (file.name.endsWith('.wdraft')) {
          const buffer = await file.arrayBuffer();
          const parsed = parseWdraftBinary(buffer);
          await editor.importProject(parsed);
          status.show(t.file.openedOk, 'success');
        } else {
          await editor.importImage(file);
          status.show(t.toolbar.imageImportedOk, 'success');
        }
      } catch (error) {
        status.show(getErrorMessage(error), 'error');
      } finally {
        fileInput.value = '';
      }
    })();
  });

  return fileInput;
}
