import {Tool} from '../core/types';
import type {WebDraftEditor} from '../core/webdraft-editor';
import {createColorPicker} from './color-picker';
import {bindKeyboardShortcuts} from './keyboard-shortcuts';
import {createLayersPanel} from './layers-panel';

type ToolConfig = {
  id: Tool;
  label: string;
  icon: string;
};

const tools: ToolConfig[] = [
  {id: Tool.Pencil, label: 'Pencil', icon: 'P'},
  {id: Tool.Eraser, label: 'Eraser', icon: 'E'},
  {id: Tool.Rectangle, label: 'Rectangle', icon: 'R'},
  {id: Tool.Ellipse, label: 'Ellipse', icon: 'O'},
];

export function createToolbar(editor: WebDraftEditor): HTMLElement {
  const toolbar = document.createElement('div');
  toolbar.className = 'toolbar';

  const title = document.createElement('h1');
  title.textContent = 'WebDraft';

  const toolGroup = document.createElement('div');
  toolGroup.className = 'toolbar__group';

  const toolButtons = new Map<Tool, HTMLButtonElement>();

  for (const tool of tools) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tool-button';
    button.dataset.tool = tool.id;
    button.title = tool.label;
    button.textContent = tool.icon;

    button.addEventListener('click', () => {
      editor.setTool(tool.id);
    });

    toolButtons.set(tool.id, button);
    toolGroup.append(button);
  }

  const sizeControl = document.createElement('label');
  sizeControl.className = 'range-control';
  sizeControl.textContent = 'Size';

  const sizeValue = document.createElement('span');
  sizeValue.textContent = String(editor.state.size);

  const sizeInput = document.createElement('input');
  sizeInput.type = 'range';
  sizeInput.min = '1';
  sizeInput.max = '120';
  sizeInput.value = String(editor.state.size);
  sizeInput.addEventListener('input', () => {
    const size = Number(sizeInput.value);
    sizeValue.textContent = String(size);
    editor.setSize(size);
  });

  sizeControl.append(sizeInput, sizeValue);

  const colorPicker = createColorPicker({
    label: 'Color',
    value: editor.state.color,
    onChange: (color) => editor.setColor(color),
  });

  const clearButton = document.createElement('button');
  clearButton.type = 'button';
  clearButton.className = 'command-button';
  clearButton.textContent = 'Clear';
  clearButton.addEventListener('click', () => editor.clear());

  const undoButton = document.createElement('button');
  undoButton.type = 'button';
  undoButton.className = 'command-button';
  undoButton.textContent = 'Undo';
  undoButton.addEventListener('click', () => editor.undo());

  const redoButton = document.createElement('button');
  redoButton.type = 'button';
  redoButton.className = 'command-button';
  redoButton.textContent = 'Redo';
  redoButton.addEventListener('click', () => editor.redo());

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

  const uploadButton = document.createElement('button');
  uploadButton.type = 'button';
  uploadButton.className = 'command-button';
  uploadButton.textContent = 'Upload image';
  uploadButton.addEventListener('click', () => fileInput.click());

  const exportButton = document.createElement('button');
  exportButton.type = 'button';
  exportButton.className = 'command-button';
  exportButton.textContent = 'Export PNG';
  const exportImage = async () => {
    const blob = await editor.exportPng();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'webdraft-image.png';
    link.click();
    URL.revokeObjectURL(url);
  };

  exportButton.addEventListener('click', () => {
    void exportImage();
  });

  const renderState = () => {
    for (const [tool, button] of toolButtons) {
      button.classList.toggle('is-active', tool === editor.state.activeTool);
    }

    sizeInput.value = String(editor.state.size);
    sizeValue.textContent = String(editor.state.size);
    undoButton.disabled = !editor.canUndo;
    redoButton.disabled = !editor.canRedo;
  };

  editor.addEventListener('change', renderState);
  renderState();

  toolbar.append(
    title,
    toolGroup,
    colorPicker,
    sizeControl,
    clearButton,
    undoButton,
    redoButton,
    uploadButton,
    exportButton,
    fileInput,
    createLayersPanel(editor),
  );

  bindKeyboardShortcuts(editor, {
    openImagePicker: () => fileInput.click(),
    exportImage,
  });

  return toolbar;
}
