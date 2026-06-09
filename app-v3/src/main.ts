import { WebDraftEditor } from './core/webdraft-editor';
import { createLayersPanel } from './ui/layers-panel';
import { createStatusToasts } from './ui/status-toasts';
import { createToolbar } from './ui/toolbar';
import { createToolbarSection } from './ui/toolbar-controls';
import './styles.css';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('Missing #app root element.');
}

const shell = document.createElement('main');
shell.className = 'app-shell';

const sidebar = document.createElement('aside');
sidebar.className = 'sidebar';

const workspace = document.createElement('section');
workspace.className = 'workspace';

const surface = document.createElement('div');
surface.className = 'canvas-surface';

const rightPanel = document.createElement('aside');
rightPanel.className = 'right-panel';

const statusToasts = createStatusToasts();

workspace.append(surface);
shell.append(sidebar, workspace, rightPanel);
app.append(shell, statusToasts);

const editor = new WebDraftEditor(surface, {
  width: 900,
  height: 620,
  color: '#111111',
  size: 10
});

sidebar.append(createToolbar(editor, statusToasts));
const rightToolbar = document.createElement('div');
rightToolbar.className = 'toolbar';
rightToolbar.append(createToolbarSection(createLayersPanel(editor)));
rightPanel.append(rightToolbar);
editor.mount();
