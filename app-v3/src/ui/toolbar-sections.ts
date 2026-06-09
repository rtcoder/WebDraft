import {parseWdraftFile} from '../core/project-file';
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
  {
    id: Tool.Select,
    label: 'Select — S',
    icon: '<path d="M4 2L4 18L8 13L11 20L13 19L9 12L15 12Z" fill="currentColor" stroke="none"/>',
  },
  {
    id: Tool.Pencil,
    label: 'Pencil — P',
    icon: '<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>',
  },
  {
    id: Tool.Eraser,
    label: 'Eraser — E',
    icon: '<path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/>',
  },
  {
    id: Tool.Sampler,
    label: 'Sampler — C',
    icon: '<path d="m2 22 1-1h3l9-9"/><path d="M3 21v-3l9-9"/><path d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3l.4.4Z"/>',
  },
  {
    id: Tool.FillBucket,
    label: 'Fill bucket — B',
    icon: '<path d="m19 11-8-8-8.5 8.5a5.5 5.5 0 0 0 7.78 7.78L19 11Z"/><path d="m20 12 2 2a7 7 0 0 1-7 7"/><circle cx="20.5" cy="20.5" r="1.5" fill="currentColor" stroke="none"/>',
  },
  {
    id: Tool.Web,
    label: 'Web — W',
    icon: '<circle cx="6" cy="6" r="2" fill="currentColor" stroke="none"/><circle cx="18" cy="6" r="2" fill="currentColor" stroke="none"/><circle cx="12" cy="19" r="2" fill="currentColor" stroke="none"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="7" y1="7.7" x2="11.3" y2="17.3"/><line x1="17" y1="7.7" x2="12.7" y2="17.3"/>',
  },
  {
    id: Tool.Rectangle,
    label: 'Rectangle — R',
    icon: '<rect x="3" y="6" width="18" height="12" rx="2"/>',
  },
  {
    id: Tool.Ellipse,
    label: 'Ellipse — O',
    icon: '<ellipse cx="12" cy="12" rx="10" ry="7"/>',
  },
  {
    id: Tool.Text,
    label: 'Text — T',
    icon: '<path d="M4 7V5h16v2"/><path d="M9 20h6"/><path d="M12 5v15"/>',
  },
];

function createSvgIcon(content: string): SVGSVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', '18');
  svg.setAttribute('height', '18');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = content;
  return svg;
}

function createEditButton(title: string, svgContent: string, onClick: () => void): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'command-button';
  button.title = title;
  button.append(createSvgIcon(svgContent));
  button.addEventListener('click', onClick);
  return button;
}

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
    button.append(createSvgIcon(tool.icon));
    button.addEventListener('click', () => {
      editor.setTool(tool.id);
    });

    toolButtons.set(tool.id, button);
    toolGroup.append(button);
  }

  const transformGroup = createGrid(
    'toolbar__group',
    createEditButton(
      'Invert colors — I',
      '<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18V3z" fill="currentColor" stroke="none"/>',
      () => editor.invertActiveLayer(),
    ),
    createEditButton(
      'Rotate left — ,',
      '<path d="M2.5 2v6h6"/><path d="M2.66 15.57a10 10 0 1 0 .57-8.38"/>',
      () => editor.rotateActiveLayer('left'),
    ),
    createEditButton(
      'Rotate right — .',
      '<path d="M21.5 2v6h-6"/><path d="M21.34 15.57a10 10 0 1 1-.57-8.38"/>',
      () => editor.rotateActiveLayer('right'),
    ),
    createEditButton(
      'Mirror horizontally — H',
      '<path d="M12 3v18"/><path d="M4 7 1 12l3 5"/><path d="M20 7l3 5-3 5"/>',
      () => editor.mirrorActiveLayer('horizontal'),
    ),
    createEditButton(
      'Mirror vertically — V',
      '<path d="M3 12h18"/><path d="M7 4l5-3 5 3"/><path d="M7 20l5 3 5-3"/>',
      () => editor.mirrorActiveLayer('vertical'),
    ),
  );

  return {
    element: createToolbarSection(toolGroup, transformGroup),
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

  const syncVisibility = () => {
    const tool = editor.state.activeTool;
    const isShape = tool === Tool.Rectangle || tool === Tool.Ellipse;
    const isBucket = tool === Tool.FillBucket;
    const isWeb = tool === Tool.Web;
    const hasBrushSize = tool === Tool.Pencil || tool === Tool.Eraser;
    fillToggle.element.hidden = !isShape;
    fillColorPicker.hidden = !isShape;
    fillOpacityControl.element.hidden = !isShape;
    fillToleranceControl.element.hidden = !isBucket;
    webSensitivityControl.element.hidden = !isWeb;
    sizeControl.element.hidden = !hasBrushSize && !isWeb && !isShape;
  };

  syncVisibility();

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
      syncVisibility();
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

  const syncShadowDetails = () => {
    const visible = editor.state.shadowEnabled;
    shadowColorPicker.hidden = !visible;
    shadowBlurControl.element.hidden = !visible;
    shadowXControl.element.hidden = !visible;
    shadowYControl.element.hidden = !visible;
  };

  syncShadowDetails();

  return {
    element: createToolbarSection(
      shadowToggle.element,
      shadowColorPicker,
      shadowBlurControl.element,
      shadowXControl.element,
      shadowYControl.element,
    ),
    sync: () => {
      syncShadowDetails();
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

  const element = createToolbarSection(
    createGrid('field-grid', fontSelect, alignSelect, textBoldToggle.element, textItalicToggle.element),
  );

  element.hidden = editor.state.activeTool !== Tool.Text;

  return {
    element,
    sync: () => {
      element.hidden = editor.state.activeTool !== Tool.Text;
      fontSelect.value = editor.state.textFontFamily;
      alignSelect.value = editor.state.textAlign;
      textBoldToggle.setChecked(editor.state.textBold);
      textItalicToggle.setChecked(editor.state.textItalic);
    },
  };
}

export function createEditSection(editor: WebDraftEditor): ToolbarSection {
  const clearButton = createEditButton(
    'Clear',
    '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>',
    () => editor.clear(),
  );
  const undoButton = createEditButton(
    'Undo — Ctrl+Z',
    '<path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
    () => editor.undo(),
  );
  const redoButton = createEditButton(
    'Redo — Ctrl+Shift+Z',
    '<path d="M15 14l5-5-5-5"/><path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13"/>',
    () => editor.redo(),
  );
  const copyButton = createEditButton(
    'Copy — Ctrl+C',
    '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    () => editor.copySelection(),
  );
  const cutButton = createEditButton(
    'Cut — Ctrl+X',
    '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4L8.12 15.88M14.47 9.53L20 20M8.12 8.12L12 12"/>',
    () => editor.cutSelection(),
  );
  const pasteButton = createEditButton(
    'Paste — Ctrl+V',
    '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z"/>',
    () => editor.pasteSelection(),
  );
  return {
    element: createToolbarSection(
      createGrid('command-grid', clearButton, undoButton, redoButton, copyButton, cutButton, pasteButton),
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


export function createProjectSection(editor: WebDraftEditor, status: StatusReporter): ToolbarSection {
  const saveButton = createCommandButton('Save project', () => {
    void (async () => {
      try {
        const blob = await editor.exportProject();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'project.wdraft';
        link.click();
        URL.revokeObjectURL(url);
        status.show('Project saved.', 'success');
      } catch (error) {
        status.show(getErrorMessage(error), 'error');
      }
    })();
  });

  const wdraftInput = document.createElement('input');
  wdraftInput.type = 'file';
  wdraftInput.accept = '.wdraft';
  wdraftInput.className = 'visually-hidden';
  wdraftInput.addEventListener('change', () => {
    const file = wdraftInput.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      void (async () => {
        try {
          const parsed = parseWdraftFile(reader.result as string);
          await editor.importProject(parsed);
          status.show('Project opened.', 'success');
        } catch (error) {
          status.show(getErrorMessage(error), 'error');
        } finally {
          wdraftInput.value = '';
        }
      })();
    };
    reader.readAsText(file);
  });

  const openButton = createCommandButton('Open project', () => wdraftInput.click());

  return {
    element: createToolbarSection(createGrid('toolbar__stack', saveButton, openButton, wdraftInput)),
    sync: () => {},
  };
}

export function syncToolbarSections(sections: ToolbarSection[]): void {
  for (const section of sections) {
    section.sync();
  }
}
