export type CheckboxControl = {
  element: HTMLLabelElement;
  setChecked: (checked: boolean) => void;
};

export type RangeControl = {
  element: HTMLLabelElement;
  setValue: (value: number) => void;
};

export function createCommandButton(label: string, onClick: () => void): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'command-button';
  button.textContent = label;
  button.addEventListener('click', onClick);

  return button;
}

export function createNumberInput(label: string, value: number): HTMLInputElement {
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

export function createCheckboxControl(
  label: string,
  checked: boolean,
  onChange: (checked: boolean) => void,
): CheckboxControl {
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

export function createRangeControl(options: {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
}): RangeControl {
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

export function createSelectControl<T extends string>(
  title: string,
  options: readonly T[],
  onChange: (value: T) => void,
): HTMLSelectElement {
  const select = document.createElement('select');
  select.className = 'select-control';
  select.title = title;

  for (const option of options) {
    const item = document.createElement('option');
    item.value = option;
    item.textContent = option;
    select.append(item);
  }

  select.addEventListener('change', () => onChange(select.value as T));

  return select;
}

export function createGrid(className: string, ...children: HTMLElement[]): HTMLDivElement {
  const grid = document.createElement('div');
  grid.className = className;
  grid.append(...children);

  return grid;
}

export function createToolbarSection(...children: HTMLElement[]): HTMLElement {
  const section = document.createElement('section');
  section.className = 'toolbar__section';
  section.append(...children);

  return section;
}
