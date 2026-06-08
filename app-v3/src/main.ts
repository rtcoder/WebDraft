import { WebDraftEditor } from './core/webdraft-editor';
import { createStatusToasts } from './ui/status-toasts';
import { createToolbar } from './ui/toolbar';
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

const statusToasts = createStatusToasts();

workspace.append(surface);
shell.append(sidebar, workspace);
app.append(shell, statusToasts);

const editor = new WebDraftEditor(surface, {
  width: 900,
  height: 620,
  color: '#111111',
  size: 10
});

sidebar.append(createToolbar(editor, statusToasts));
editor.mount();
