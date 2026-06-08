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
  {id: Tool.Select, label: 'Select', icon: 'S'},
  {id: Tool.Pencil, label: 'Pencil', icon: 'P'},
  {id: Tool.Eraser, label: 'Eraser', icon: 'E'},
  {id: Tool.Sampler, label: 'Sampler', icon: 'C'},
  {id: Tool.Web, label: 'Web', icon: 'W'},
  {id: Tool.Rectangle, label: 'Rectangle', icon: 'R'},
  {id: Tool.Ellipse, label: 'Ellipse', icon: 'O'},
  {id: Tool.Text, label: 'Text', icon: 'T'},
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

  const webSensitivityControl = document.createElement('label');
  webSensitivityControl.className = 'range-control';
  webSensitivityControl.textContent = 'Web';

  const webSensitivityValue = document.createElement('span');
  webSensitivityValue.textContent = String(editor.state.webSensitivity);

  const webSensitivityInput = document.createElement('input');
  webSensitivityInput.type = 'range';
  webSensitivityInput.min = '20';
  webSensitivityInput.max = '260';
  webSensitivityInput.value = String(editor.state.webSensitivity);
  webSensitivityInput.addEventListener('input', () => {
    const sensitivity = Number(webSensitivityInput.value);
    webSensitivityValue.textContent = String(sensitivity);
    editor.setWebSensitivity(sensitivity);
  });

  webSensitivityControl.append(webSensitivityInput, webSensitivityValue);

  const colorPicker = createColorPicker({
    label: 'Color',
    value: editor.state.color,
    onChange: (color) => editor.setColor(color),
  });

  const fillToggle = document.createElement('label');
  fillToggle.className = 'checkbox-control';

  const fillCheckbox = document.createElement('input');
  fillCheckbox.type = 'checkbox';
  fillCheckbox.checked = editor.state.fillEnabled;
  fillCheckbox.addEventListener('change', () => {
    editor.setFillEnabled(fillCheckbox.checked);
  });

  const fillText = document.createElement('span');
  fillText.textContent = 'Fill shapes';
  fillToggle.append(fillCheckbox, fillText);

  const fillColorPicker = createColorPicker({
    label: 'Fill color',
    value: editor.state.fillColor,
    onChange: (color) => editor.setFillColor(color),
  });

  const fillOpacityControl = createRangeControl({
    label: 'Fill opacity',
    min: 0,
    max: 100,
    value: editor.state.fillOpacity,
    onChange: (value) => editor.setFillOpacity(value),
  });

  const shadowToggle = createCheckboxControl('Shadow', editor.state.shadowEnabled, (enabled) => {
    editor.setShadowEnabled(enabled);
  });

  const shadowColorPicker = createColorPicker({
    label: 'Shadow color',
    value: editor.state.shadowColor,
    onChange: (color) => editor.setShadowColor(color),
  });

  const shadowBlurControl = createRangeControl({
    label: 'Shadow blur',
    min: 0,
    max: 80,
    value: editor.state.shadowBlur,
    onChange: (value) => editor.setShadowBlur(value),
  });

  const shadowXControl = createRangeControl({
    label: 'Shadow X',
    min: -120,
    max: 120,
    value: editor.state.shadowOffsetX,
    onChange: (value) => editor.setShadowOffsetX(value),
  });

  const shadowYControl = createRangeControl({
    label: 'Shadow Y',
    min: -120,
    max: 120,
    value: editor.state.shadowOffsetY,
    onChange: (value) => editor.setShadowOffsetY(value),
  });

  const fontSelect = document.createElement('select');
  fontSelect.className = 'select-control';
  fontSelect.title = 'Text font';
  for (const option of ['sans-serif', 'serif', 'monospace', 'cursive']) {
    const item = document.createElement('option');
    item.value = option;
    item.textContent = option;
    fontSelect.append(item);
  }
  fontSelect.addEventListener('change', () => editor.setTextFontFamily(fontSelect.value));

  const alignSelect = document.createElement('select');
  alignSelect.className = 'select-control';
  alignSelect.title = 'Text alignment';
  for (const option of ['left', 'center', 'right'] as CanvasTextAlign[]) {
    const item = document.createElement('option');
    item.value = option;
    item.textContent = option;
    alignSelect.append(item);
  }
  alignSelect.addEventListener('change', () => editor.setTextAlign(alignSelect.value as CanvasTextAlign));

  const textBoldToggle = createCheckboxControl('Bold', editor.state.textBold, (enabled) => {
    editor.setTextBold(enabled);
  });
  const textItalicToggle = createCheckboxControl('Italic', editor.state.textItalic, (enabled) => {
    editor.setTextItalic(enabled);
  });

  const resizeWidthInput = createNumberInput('Width', editor.state.canvasWidth);
  const resizeHeightInput = createNumberInput('Height', editor.state.canvasHeight);
  const resizeButton = createCommandButton('Resize canvas', () => {
    editor.resizeCanvas(Number(resizeWidthInput.value), Number(resizeHeightInput.value));
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

  const copyButton = document.createElement('button');
  copyButton.type = 'button';
  copyButton.className = 'command-button';
  copyButton.textContent = 'Copy';
  copyButton.addEventListener('click', () => editor.copySelection());

  const cutButton = document.createElement('button');
  cutButton.type = 'button';
  cutButton.className = 'command-button';
  cutButton.textContent = 'Cut';
  cutButton.addEventListener('click', () => editor.cutSelection());

  const pasteButton = document.createElement('button');
  pasteButton.type = 'button';
  pasteButton.className = 'command-button';
  pasteButton.textContent = 'Paste';
  pasteButton.addEventListener('click', () => editor.pasteSelection());

  const transformGroup = document.createElement('div');
  transformGroup.className = 'command-grid';

  const invertButton = createCommandButton('Invert', () => editor.invertActiveLayer());
  const rotateLeftButton = createCommandButton('Rotate L', () => editor.rotateActiveLayer('left'));
  const rotateRightButton = createCommandButton('Rotate R', () => editor.rotateActiveLayer('right'));
  const mirrorHorizontalButton = createCommandButton('Mirror H', () => editor.mirrorActiveLayer('horizontal'));
  const mirrorVerticalButton = createCommandButton('Mirror V', () => editor.mirrorActiveLayer('vertical'));

  invertButton.title = 'Invert colors';
  rotateLeftButton.title = 'Rotate left';
  rotateRightButton.title = 'Rotate right';
  mirrorHorizontalButton.title = 'Mirror horizontally';
  mirrorVerticalButton.title = 'Mirror vertically';
  transformGroup.append(invertButton, rotateLeftButton, rotateRightButton, mirrorHorizontalButton, mirrorVerticalButton);

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

  const cameraButton = document.createElement('button');
  cameraButton.type = 'button';
  cameraButton.className = 'command-button';
  cameraButton.textContent = 'Camera snap';
  cameraButton.addEventListener('click', () => {
    void editor.importCameraFrame();
  });

  const renderState = () => {
    for (const [tool, button] of toolButtons) {
      button.classList.toggle('is-active', tool === editor.state.activeTool);
    }

    sizeInput.value = String(editor.state.size);
    sizeValue.textContent = String(editor.state.size);
    webSensitivityInput.value = String(editor.state.webSensitivity);
    webSensitivityValue.textContent = String(editor.state.webSensitivity);
    colorPicker.setValue(editor.state.color);
    fillColorPicker.setValue(editor.state.fillColor);
    fillOpacityControl.setValue(editor.state.fillOpacity);
    fillCheckbox.checked = editor.state.fillEnabled;
    shadowToggle.setChecked(editor.state.shadowEnabled);
    shadowColorPicker.setValue(editor.state.shadowColor);
    shadowBlurControl.setValue(editor.state.shadowBlur);
    shadowXControl.setValue(editor.state.shadowOffsetX);
    shadowYControl.setValue(editor.state.shadowOffsetY);
    fontSelect.value = editor.state.textFontFamily;
    alignSelect.value = editor.state.textAlign;
    textBoldToggle.setChecked(editor.state.textBold);
    textItalicToggle.setChecked(editor.state.textItalic);
    resizeWidthInput.value = String(editor.state.canvasWidth);
    resizeHeightInput.value = String(editor.state.canvasHeight);
    undoButton.disabled = !editor.canUndo;
    redoButton.disabled = !editor.canRedo;
    copyButton.disabled = !editor.hasSelection;
    cutButton.disabled = !editor.hasSelection;
    pasteButton.disabled = !editor.canPaste;
  };

  editor.addEventListener('change', renderState);
  renderState();

  const editGroup = document.createElement('div');
  editGroup.className = 'command-grid';
  editGroup.append(clearButton, undoButton, redoButton, copyButton, cutButton, pasteButton);

  const fileGroup = document.createElement('div');
  fileGroup.className = 'toolbar__stack';
  fileGroup.append(uploadButton, cameraButton, exportButton, fileInput);

  const resizeGroup = document.createElement('div');
  resizeGroup.className = 'field-grid';
  resizeGroup.append(resizeWidthInput, resizeHeightInput, resizeButton);

  const textGroup = document.createElement('div');
  textGroup.className = 'field-grid';
  textGroup.append(fontSelect, alignSelect, textBoldToggle.element, textItalicToggle.element);

  toolbar.append(
    title,
    createToolbarSection(toolGroup),
    createToolbarSection(colorPicker, fillToggle, fillColorPicker, fillOpacityControl.element, sizeControl, webSensitivityControl),
    createToolbarSection(shadowToggle.element, shadowColorPicker, shadowBlurControl.element, shadowXControl.element, shadowYControl.element),
    createToolbarSection(textGroup),
    createToolbarSection(editGroup, transformGroup),
    createToolbarSection(resizeGroup),
    createToolbarSection(fileGroup),
    createToolbarSection(createLayersPanel(editor)),
  );

  bindKeyboardShortcuts(editor, {
    openImagePicker: () => fileInput.click(),
    exportImage,
  });

  return toolbar;
}

function createCommandButton(label: string, onClick: () => void): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'command-button';
  button.textContent = label;
  button.addEventListener('click', onClick);

  return button;
}

function createNumberInput(label: string, value: number): HTMLInputElement {
  const input = document.createElement('input');
  input.type = 'number';
  input.className = 'number-control';
  input.min = '64';
  input.max = '4096';
  input.step = '1';
  input.value = String(value);
  input.placeholder = label;
  input.title = label;

  return input;
}

function createCheckboxControl(
  label: string,
  checked: boolean,
  onChange: (checked: boolean) => void,
): {element: HTMLLabelElement; setChecked: (checked: boolean) => void} {
  const element = document.createElement('label');
  element.className = 'checkbox-control';

  const input = document.createElement('input');
  input.type = 'checkbox';
  input.checked = checked;
  input.addEventListener('change', () => onChange(input.checked));

  const text = document.createElement('span');
  text.textContent = label;
  element.append(input, text);

  return {
    element,
    setChecked: (nextChecked: boolean) => {
      input.checked = nextChecked;
    },
  };
}

function createRangeControl(options: {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
}): {element: HTMLLabelElement; setValue: (value: number) => void} {
  const element = document.createElement('label');
  element.className = 'range-control';
  element.textContent = options.label;

  const value = document.createElement('span');
  value.textContent = String(options.value);

  const input = document.createElement('input');
  input.type = 'range';
  input.min = String(options.min);
  input.max = String(options.max);
  input.value = String(options.value);
  input.addEventListener('input', () => {
    const nextValue = Number(input.value);
    value.textContent = String(nextValue);
    options.onChange(nextValue);
  });

  element.append(input, value);

  return {
    element,
    setValue: (nextValue: number) => {
      input.value = String(nextValue);
      value.textContent = String(nextValue);
    },
  };
}

function createToolbarSection(...children: HTMLElement[]): HTMLElement {
  const section = document.createElement('section');
  section.className = 'toolbar__section';
  section.append(...children);

  return section;
}
