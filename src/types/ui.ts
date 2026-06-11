export type StatusTone = 'info' | 'success' | 'error';

export type StatusReporter = {
  show: (message: string, tone?: StatusTone) => void;
};

export type ColorPickerOptions = {
  label: string;
  value: string;
  onChange: (color: string) => void;
};

export type ColorPickerControl = HTMLElement & {
  setValue: (color: string) => void;
};

export type TextToolbarDefaults = {
  fontSize: number;
  fontFamily: string;
  color: string;
  align: CanvasTextAlign;
};

export type SaveAction = 'png' | 'project';

export type CheckboxControl = {
  element: HTMLLabelElement;
  setChecked: (checked: boolean) => void;
};

export type RangeControl = {
  element: HTMLLabelElement;
  setValue: (value: number) => void;
};

export type MenuItem =
  | { type: 'action'; label: string; action: () => void; shortcut?: string; disabled?: () => boolean }
  | { type: 'separator' };

export type Menu = { label: string; items: MenuItem[] };

export type ResizeDialogOptions = {
  title: string;
  width: number;
  height: number;
  checkboxLabel?: string;
  checkboxChecked?: boolean;
  onConfirm: (w: number, h: number, all: boolean) => void;
};
