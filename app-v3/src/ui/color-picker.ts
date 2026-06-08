export type ColorPickerOptions = {
  label: string;
  value: string;
  onChange: (color: string) => void;
};

export function createColorPicker(options: ColorPickerOptions): HTMLElement {
  const wrapper = document.createElement('label');
  wrapper.className = 'color-picker';

  const swatch = document.createElement('span');
  swatch.className = 'color-picker__swatch';
  swatch.style.backgroundColor = options.value;

  const text = document.createElement('span');
  text.textContent = options.label;

  const input = document.createElement('input');
  input.type = 'color';
  input.value = options.value;
  input.addEventListener('input', () => {
    swatch.style.backgroundColor = input.value;
    options.onChange(input.value);
  });

  wrapper.append(swatch, text, input);

  return wrapper;
}
