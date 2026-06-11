import type { SizeWithPosition } from '../core/types';

export type TextToolbarDefaults = {
  fontSize: number;
  fontFamily: string;
  color: string;
  align: CanvasTextAlign;
};

const FONT_FAMILIES = ['sans-serif', 'serif', 'monospace', 'cursive', 'fantasy'];
const FONT_SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64, 72, 96, 128];

const ALIGN_ICONS: Record<string, string> = {
  left:   '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><line x1="1" y1="4"  x2="15" y2="4"/><line x1="1" y1="8"  x2="10" y2="8"/><line x1="1" y1="12" x2="13" y2="12"/></svg>',
  center: '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><line x1="1" y1="4"  x2="15" y2="4"/><line x1="3" y1="8"  x2="13" y2="8"/><line x1="2" y1="12" x2="14" y2="12"/></svg>',
  right:  '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><line x1="1" y1="4"  x2="15" y2="4"/><line x1="6" y1="8"  x2="15" y2="8"/><line x1="3" y1="12" x2="15" y2="12"/></svg>',
};

export function createTextToolbar(
  contentEl: HTMLElement,
  bounds: SizeWithPosition,
  defaults: TextToolbarDefaults,
  onAlignChange: (align: CanvasTextAlign) => void,
): { element: HTMLElement; cleanup: () => void } {
  const toolbar = document.createElement('div');
  toolbar.className = 'text-toolbar';

  const top = bounds.y >= 44 ? bounds.y - 44 : bounds.y + bounds.height + 8;
  toolbar.style.top = `${top}px`;
  toolbar.style.left = `${Math.max(0, bounds.x)}px`;

  // --- helpers ---

  const mkBtn = (title: string, html: string, extraClass = ''): HTMLButtonElement => {
    const b = document.createElement('button');
    b.type = 'button';
    b.title = title;
    b.className = `text-toolbar-btn${extraClass ? ' ' + extraClass : ''}`;
    b.innerHTML = html;
    b.addEventListener('mousedown', (e) => e.preventDefault());
    return b;
  };

  const sep = (): HTMLElement => {
    const d = document.createElement('div');
    d.className = 'text-toolbar-sep';
    return d;
  };

  let savedRange: Range | null = null;

  const saveRange = (): void => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const r = sel.getRangeAt(0);
      if (contentEl.contains(r.commonAncestorContainer)) savedRange = r.cloneRange();
    }
  };

  const restoreAndApply = (fn: () => void): void => {
    contentEl.focus();
    if (savedRange) {
      const sel = window.getSelection();
      if (sel) { sel.removeAllRanges(); sel.addRange(savedRange); }
      savedRange = null;
    }
    fn();
  };

  // --- Alignment ---

  const alignBtns: Record<string, HTMLButtonElement> = {
    left:   mkBtn('Align left',   ALIGN_ICONS['left'],   'text-toolbar-align'),
    center: mkBtn('Align center', ALIGN_ICONS['center'], 'text-toolbar-align'),
    right:  mkBtn('Align right',  ALIGN_ICONS['right'],  'text-toolbar-align'),
  };

  const setAlign = (align: CanvasTextAlign): void => {
    Object.values(alignBtns).forEach((b) => b.classList.remove('is-active'));
    const key = align === 'start' ? 'left' : align === 'end' ? 'right' : align;
    alignBtns[key]?.classList.add('is-active');
    defaults.align = align;
    contentEl.style.textAlign = align;
    onAlignChange(align);
  };

  Object.entries(alignBtns).forEach(([align, btn]) => {
    btn.addEventListener('click', () => setAlign(align as CanvasTextAlign));
  });
  setAlign(defaults.align);

  const alignGroup = document.createElement('div');
  alignGroup.className = 'text-toolbar-group';
  alignGroup.append(...Object.values(alignBtns));

  // --- Bold / Italic / Underline ---

  const btnBold      = mkBtn('Bold',      '<b>B</b>',      'text-toolbar-format');
  const btnItalic    = mkBtn('Italic',    '<i>I</i>',      'text-toolbar-format');
  const btnUnderline = mkBtn('Underline', '<u>U</u>',      'text-toolbar-format');

  btnBold.addEventListener('click',      () => document.execCommand('bold'));
  btnItalic.addEventListener('click',    () => document.execCommand('italic'));
  btnUnderline.addEventListener('click', () => document.execCommand('underline'));

  const formatGroup = document.createElement('div');
  formatGroup.className = 'text-toolbar-group';
  formatGroup.append(btnBold, btnItalic, btnUnderline);

  // --- Font family ---

  const fontFamilySelect = document.createElement('select');
  fontFamilySelect.className = 'text-toolbar-select';
  fontFamilySelect.title = 'Font family';
  FONT_FAMILIES.forEach((f) => {
    const o = document.createElement('option');
    o.value = f; o.textContent = f;
    if (f === defaults.fontFamily) o.selected = true;
    fontFamilySelect.append(o);
  });
  fontFamilySelect.addEventListener('mousedown', saveRange);
  fontFamilySelect.addEventListener('change', () => {
    restoreAndApply(() => applyInlineStyle(contentEl, 'font-family', fontFamilySelect.value));
  });

  // --- Font size ---

  const fontSizeSelect = document.createElement('select');
  fontSizeSelect.className = 'text-toolbar-select text-toolbar-size-select';
  fontSizeSelect.title = 'Font size';
  FONT_SIZES.forEach((s) => {
    const o = document.createElement('option');
    o.value = `${s}`; o.textContent = `${s}`;
    if (s === defaults.fontSize) o.selected = true;
    fontSizeSelect.append(o);
  });
  fontSizeSelect.addEventListener('mousedown', saveRange);
  fontSizeSelect.addEventListener('change', () => {
    const px = parseInt(fontSizeSelect.value);
    if (px > 0) {
      defaults.fontSize = px;
      restoreAndApply(() => applyInlineStyle(contentEl, 'font-size', `${px}px`));
    }
  });

  const fontGroup = document.createElement('div');
  fontGroup.className = 'text-toolbar-group';
  fontGroup.append(fontFamilySelect, fontSizeSelect);

  // --- Color ---

  const colorLabel = document.createElement('label');
  colorLabel.className = 'text-toolbar-color';
  colorLabel.title = 'Text color';
  const colorInput = document.createElement('input');
  colorInput.type = 'color';
  colorInput.value = defaults.color;
  colorLabel.append(colorInput);

  colorInput.addEventListener('mousedown', saveRange);
  colorInput.addEventListener('change', () => {
    restoreAndApply(() => applyInlineStyle(contentEl, 'color', colorInput.value));
  });

  toolbar.append(alignGroup, sep(), formatGroup, sep(), fontGroup, sep(), colorLabel);

  // --- Selection state update ---

  const onSelectionChange = (): void => {
    if (!contentEl.contains(window.getSelection()?.anchorNode ?? null)) return;
    btnBold.classList.toggle('is-active',      document.queryCommandState('bold'));
    btnItalic.classList.toggle('is-active',    document.queryCommandState('italic'));
    btnUnderline.classList.toggle('is-active', document.queryCommandState('underline'));
  };
  document.addEventListener('selectionchange', onSelectionChange);

  return {
    element: toolbar,
    cleanup: () => document.removeEventListener('selectionchange', onSelectionChange),
  };
}

function applyInlineStyle(contentEl: HTMLElement, prop: string, value: string): void {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;
  const range = sel.getRangeAt(0);
  if (!contentEl.contains(range.commonAncestorContainer)) return;
  if (sel.isCollapsed) return;

  try {
    const fragment = range.extractContents();
    const span = document.createElement('span');
    span.style.setProperty(prop, value);
    span.appendChild(fragment);
    range.insertNode(span);
    const newRange = document.createRange();
    newRange.selectNodeContents(span);
    sel.removeAllRanges();
    sel.addRange(newRange);
  } catch {
    // Cross-block selections may fail — ignore
  }
}
