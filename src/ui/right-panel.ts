import type {WebDraftEditor} from '../core/webdraft-editor';
import {createLayersPanel} from './layers-panel';
import type {StatusReporter} from './status-toasts';
import {createEditSection, createProjectSection, syncToolbarSections} from './toolbar-sections';
import {createToolbarSection} from './toolbar-controls';

export function createRightPanel(editor: WebDraftEditor, status: StatusReporter): HTMLElement {
  const panel = document.createElement('div');
  panel.className = 'toolbar';

  const sections = [
    createProjectSection(editor, status),
    createEditSection(editor),
    {
      element: createToolbarSection(createLayersPanel(editor)),
      sync: () => {},
    },
  ];

  editor.addEventListener('change', () => syncToolbarSections(sections));
  syncToolbarSections(sections);

  panel.append(...sections.map((s) => s.element));

  return panel;
}
