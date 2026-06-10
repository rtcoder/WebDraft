import { t } from '../core/i18n';

export type SaveAction = 'png' | 'project';

const STORAGE_KEY = 'webdraft-save-action';

function getStoredAction(): SaveAction | null {
  const v = localStorage.getItem(STORAGE_KEY);
  return v === 'png' || v === 'project' ? v : null;
}

function storeAction(action: SaveAction): void {
  localStorage.setItem(STORAGE_KEY, action);
}

function clearStoredAction(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function openSaveDialog(onAction: (action: SaveAction) => void): void {
  const stored = getStoredAction();
  if (stored) {
    onAction(stored);
    return;
  }

  const backdrop = document.createElement('div');
  backdrop.className = 'save-dialog-backdrop';

  const dialog = document.createElement('div');
  dialog.className = 'save-dialog';
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-label', t.saveDialog.title);

  const title = document.createElement('h2');
  title.className = 'save-dialog__title';
  title.textContent = t.saveDialog.title;

  const buttons = document.createElement('div');
  buttons.className = 'save-dialog__buttons';

  const pngBtn = document.createElement('button');
  pngBtn.className = 'save-dialog__btn';
  pngBtn.textContent = t.saveDialog.exportPng;

  const projectBtn = document.createElement('button');
  projectBtn.className = 'save-dialog__btn save-dialog__btn--primary';
  projectBtn.textContent = t.saveDialog.saveProject;

  buttons.append(pngBtn, projectBtn);

  const footer = document.createElement('div');
  footer.className = 'save-dialog__footer';

  const rememberLabel = document.createElement('label');
  rememberLabel.className = 'save-dialog__remember';

  const rememberCheckbox = document.createElement('input');
  rememberCheckbox.type = 'checkbox';

  const rememberText = document.createElement('span');
  rememberText.textContent = t.saveDialog.rememberChoice;

  rememberLabel.append(rememberCheckbox, rememberText);

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'save-dialog__cancel';
  cancelBtn.textContent = t.saveDialog.cancel;

  footer.append(rememberLabel, cancelBtn);
  dialog.append(title, buttons, footer);
  document.body.append(backdrop, dialog);

  function close(): void {
    backdrop.remove();
    dialog.remove();
    document.removeEventListener('keydown', onKey);
  }

  function choose(action: SaveAction): void {
    if (rememberCheckbox.checked) {
      storeAction(action);
    }
    close();
    onAction(action);
  }

  function onKey(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    }
  }

  pngBtn.addEventListener('click', () => choose('png'));
  projectBtn.addEventListener('click', () => choose('project'));
  cancelBtn.addEventListener('click', close);
  backdrop.addEventListener('click', close);
  document.addEventListener('keydown', onKey);

  projectBtn.focus();
}

export { clearStoredAction };
