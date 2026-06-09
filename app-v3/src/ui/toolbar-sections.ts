import {Tool} from '../core/types';
import type {WebDraftEditor} from '../core/webdraft-editor';
import {openCameraPanel} from './camera-panel';
import {createColorPicker} from './color-picker';
import type {StatusReporter} from './status-toasts';
import {getErrorMessage} from './status-toasts';
import {
  createCheckboxControl,
  createCommandButton,
  createGrid,
  createNumberInput,
  createRangeControl,
  createSelectControl,
  createToolbarSection,
} from './toolbar-controls';

type ToolbarSection = {
  element: HTMLElement;
  sync: () => void;
};

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
  {id: Tool.FillBucket, label: 'Fill bucket', icon: 'B'},
  {id: Tool.Web, label: 'Web', icon: 'W'},
  {id: Tool.Rectangle, label: 'Rectangle', icon: 'R'},
  {id: Tool.Ellipse, label: 'Ellipse', icon: 'O'},
  {id: Tool.Text, label: 'Text', icon: 'T'},
];

export function createToolSection(editor: WebDraftEditor): ToolbarSection {
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

  return {
    element: createToolbarSection(toolGroup),
    sync: () => {
      for (const [tool, button] of toolButtons) {
        button.classList.toggle('is-active', tool === editor.state.activeTool);
      }
    },
  };
}

export function createStyleSection(editor: WebDraftEditor): ToolbarSection {
  const sizeControl = createRangeControl({
    label: 'Size',
    min: 1,
    max: 120,
    value: editor.state.size,
    onChange: (value) => editor.setSize(value),
  });

  const webSensitivityControl = createRangeControl({
    label: 'Web',
    min: 20,
    max: 260,
    value: editor.state.webSensitivity,
    onChange: (value) => editor.setWebSensitivity(value),
  });

  const colorPicker = createColorPicker({
    label: 'Color',
    value: editor.state.color,
    onChange: (color) => editor.setColor(color),
  });

  const fillToggle = createCheckboxControl('Fill shapes', editor.state.fillEnabled, (enabled) => {
    editor.setFillEnabled(enabled);
  });

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

  const fillToleranceControl = createRangeControl({
    label: 'Bucket tolerance',
    min: 0,
    max: 255,
    value: editor.state.fillTolerance,
    onChange: (value) => editor.setFillTolerance(value),
  });

  return {
    element: createToolbarSection(
      colorPicker,
      fillToggle.element,
      fillColorPicker,
      fillOpacityControl.element,
      fillToleranceControl.element,
      sizeControl.element,
      webSensitivityControl.element,
    ),
    sync: () => {
      colorPicker.setValue(editor.state.color);
      fillToggle.setChecked(editor.state.fillEnabled);
      fillColorPicker.setValue(editor.state.fillColor);
      fillOpacityControl.setValue(editor.state.fillOpacity);
      fillToleranceControl.setValue(editor.state.fillTolerance);
      sizeControl.setValue(editor.state.size);
      webSensitivityControl.setValue(editor.state.webSensitivity);
    },
  };
}

export function createShadowSection(editor: WebDraftEditor): ToolbarSection {
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

  return {
    element: createToolbarSection(
      shadowToggle.element,
      shadowColorPicker,
      shadowBlurControl.element,
      shadowXControl.element,
      shadowYControl.element,
    ),
    sync: () => {
      shadowToggle.setChecked(editor.state.shadowEnabled);
      shadowColorPicker.setValue(editor.state.shadowColor);
      shadowBlurControl.setValue(editor.state.shadowBlur);
      shadowXControl.setValue(editor.state.shadowOffsetX);
      shadowYControl.setValue(editor.state.shadowOffsetY);
    },
  };
}

export function createTextSection(editor: WebDraftEditor): ToolbarSection {
  const fontSelect = createSelectControl('Text font', ['sans-serif', 'serif', 'monospace', 'cursive'], (font) => {
    editor.setTextFontFamily(font);
  });

  const alignSelect = createSelectControl('Text alignment', ['left', 'center', 'right'] as const, (align) => {
    editor.setTextAlign(align);
  });

  const textBoldToggle = createCheckboxControl('Bold', editor.state.textBold, (enabled) => {
    editor.setTextBold(enabled);
  });
  const textItalicToggle = createCheckboxControl('Italic', editor.state.textItalic, (enabled) => {
    editor.setTextItalic(enabled);
  });

  return {
    element: createToolbarSection(
      createGrid('field-grid', fontSelect, alignSelect, textBoldToggle.element, textItalicToggle.element),
    ),
    sync: () => {
      fontSelect.value = editor.state.textFontFamily;
      alignSelect.value = editor.state.textAlign;
      textBoldToggle.setChecked(editor.state.textBold);
      textItalicToggle.setChecked(editor.state.textItalic);
    },
  };
}

export function createEditSection(editor: WebDraftEditor): ToolbarSection {
  const clearButton = createCommandButton('Clear', () => editor.clear());
  const undoButton = createCommandButton('Undo', () => editor.undo());
  const redoButton = createCommandButton('Redo', () => editor.redo());
  const copyButton = createCommandButton('Copy', () => editor.copySelection());
  const cutButton = createCommandButton('Cut', () => editor.cutSelection());
  const pasteButton = createCommandButton('Paste', () => editor.pasteSelection());

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

  return {
    element: createToolbarSection(
      createGrid('command-grid', clearButton, undoButton, redoButton, copyButton, cutButton, pasteButton),
      createGrid(
        'command-grid',
        invertButton,
        rotateLeftButton,
        rotateRightButton,
        mirrorHorizontalButton,
        mirrorVerticalButton,
      ),
    ),
    sync: () => {
      undoButton.disabled = !editor.canUndo;
      redoButton.disabled = !editor.canRedo;
      copyButton.disabled = !editor.hasSelection;
      cutButton.disabled = !editor.hasSelection;
      pasteButton.disabled = !editor.canPaste;
    },
  };
}

export function createResizeSection(editor: WebDraftEditor, status?: StatusReporter): ToolbarSection {
  const resizeWidthInput = createNumberInput('Width', editor.state.canvasWidth);
  const resizeHeightInput = createNumberInput('Height', editor.state.canvasHeight);
  const resizeButton = createCommandButton('Resize canvas', () => {
    editor.resizeCanvas(Number(resizeWidthInput.value), Number(resizeHeightInput.value));
    status?.show(`Canvas resized to ${editor.state.canvasWidth} x ${editor.state.canvasHeight}.`, 'success');
  });

  return {
    element: createToolbarSection(createGrid('field-grid', resizeWidthInput, resizeHeightInput, resizeButton)),
    sync: () => {
      resizeWidthInput.value = String(editor.state.canvasWidth);
      resizeHeightInput.value = String(editor.state.canvasHeight);
    },
  };
}

export function createFileSection(
  editor: WebDraftEditor,
  fileInput: HTMLInputElement,
  exportImage: () => Promise<void>,
  status: StatusReporter,
): ToolbarSection {
  const uploadButton = createCommandButton('Upload image', () => fileInput.click());
  const cameraButton = createCommandButton('Camera', () => {
    openCameraPanel(editor, status);
  });
  const exportButton = createCommandButton('Export PNG', () => {
    void exportImage();
  });

  return {
    element: createToolbarSection(createGrid('toolbar__stack', uploadButton, cameraButton, exportButton, fileInput)),
    sync: () => {},
  };
}


export function syncToolbarSections(sections: ToolbarSection[]): void {
  for (const section of sections) {
    section.sync();
  }
}
