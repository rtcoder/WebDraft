import { WebDraftEditor } from './core/webdraft-editor';
import { createMenuBar } from './ui/menu-bar';
import { createRightPanel } from './ui/right-panel';
import { createStatusToasts } from './ui/status-toasts';
import { createToolbar } from './ui/toolbar';
import { restoreStateAfterReload } from './ui/lang-state';
import './styles.css';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('Missing #app root element.');
}

const appWrap = document.createElement('div');
appWrap.className = 'app-wrap';

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
appWrap.append(shell);
app.append(appWrap, statusToasts);

const editor = new WebDraftEditor(surface, {
  width: 900,
  height: 620,
  color: '#111111',
  size: 10
});

appWrap.prepend(createMenuBar(editor, statusToasts));
sidebar.append(createToolbar(editor, statusToasts));
rightPanel.append(createRightPanel(editor, statusToasts));
editor.mount();
void restoreStateAfterReload(editor);
