import type {WebDraftEditor} from '../core/webdraft-editor';
import {createLayersPanel} from './layers-panel';
import {createEditSection, syncToolbarSections} from './toolbar-sections';
import {createToolbarSection} from './toolbar-controls';

export function createRightPanel(editor: WebDraftEditor): HTMLElement {
  const panel = document.createElement('div');
  panel.className = 'toolbar';

  const sections = [
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
