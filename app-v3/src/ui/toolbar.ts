import type { WebDraftEditor } from '../core/webdraft-editor';
import type { ToolId } from '../core/types';
import { createColorPicker } from './color-picker';

type ToolConfig = {
  id: ToolId;
  label: string;
  icon: string;
};

const tools: ToolConfig[] = [
  { id: 'pencil', label: 'Pencil', icon: 'P' },
  { id: 'eraser', label: 'Eraser', icon: 'E' }
];

export function createToolbar(editor: WebDraftEditor): HTMLElement {
  const toolbar = document.createElement('div');
  toolbar.className = 'toolbar';

  const title = document.createElement('h1');
  title.textContent = 'WebDraft';

  const toolGroup = document.createElement('div');
  toolGroup.className = 'toolbar__group';

  const toolButtons = new Map<ToolId, HTMLButtonElement>();

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
    onChange: (color) => editor.setColor(color)
  });

  const clearButton = document.createElement('button');
  clearButton.type = 'button';
  clearButton.className = 'command-button';
  clearButton.textContent = 'Clear';
  clearButton.addEventListener('click', () => editor.clear());

  const renderState = () => {
    for (const [tool, button] of toolButtons) {
      button.classList.toggle('is-active', tool === editor.state.activeTool);
    }
  };

  editor.addEventListener('change', renderState);
  renderState();

  toolbar.append(title, toolGroup, colorPicker, sizeControl, clearButton);

  return toolbar;
}
