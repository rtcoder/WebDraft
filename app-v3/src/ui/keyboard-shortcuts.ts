import {Tool} from '../core/types';
import type {WebDraftEditor} from '../core/webdraft-editor';

type ShortcutOptions = {
  openImagePicker: () => void;
  exportImage: () => Promise<void>;
};

export function bindKeyboardShortcuts(editor: WebDraftEditor, options: ShortcutOptions): void {
  window.addEventListener('keydown', (event) => {
    if (isTypingTarget(event.target)) {
      return;
    }

    const key = event.key.toLowerCase();
    const isCommand = event.metaKey || event.ctrlKey;

    if (isCommand && key === 'o') {
      event.preventDefault();
      options.openImagePicker();
      return;
    }

    if (isCommand && key === 's') {
      event.preventDefault();
      void options.exportImage();
      return;
    }

    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      editor.clear();
      return;
    }

    if (key === '[') {
      event.preventDefault();
      editor.setSize(editor.state.size - 1);
      return;
    }

    if (key === ']') {
      event.preventDefault();
      editor.setSize(editor.state.size + 1);
      return;
    }

    const tool = getToolForKey(key);

    if (tool) {
      event.preventDefault();
      editor.setTool(tool);
    }
  });
}

function getToolForKey(key: string): Tool | null {
  switch (key) {
    case 'p':
      return Tool.Pencil;
    case 'e':
      return Tool.Eraser;
    case 'r':
      return Tool.Rectangle;
    case 'o':
      return Tool.Ellipse;
    default:
      return null;
  }
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return (
    target.isContentEditable ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  );
}
