import { t } from '../core/i18n';

type ResizeDialogOptions = {
  title: string;
  width: number;
  height: number;
  checkboxLabel?: string;
  checkboxChecked?: boolean;
  onConfirm: (w: number, h: number, all: boolean) => void;
};

export function openResizeDialog(opts: ResizeDialogOptions): void {
  const backdrop = document.createElement('div');
  backdrop.className = 'resize-dlg-backdrop';

  const dialog = document.createElement('div');
  dialog.className = 'resize-dlg';
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');

  const titleEl = document.createElement('h2');
  titleEl.className = 'resize-dlg__title';
  titleEl.textContent = opts.title;

  function makeField(labelText: string, defaultValue: number): { row: HTMLElement; input: HTMLInputElement } {
    const row = document.createElement('div');
    row.className = 'resize-dlg__field';
    const lbl = document.createElement('label');
    lbl.className = 'resize-dlg__label';
    lbl.textContent = labelText;
    const input = document.createElement('input');
    input.type = 'number';
    input.className = 'resize-dlg__input';
    input.min = '1';
    input.max = '8192';
    input.value = String(defaultValue);
    lbl.append(input);
    row.append(lbl);
    return { row, input };
  }

  const { row: wRow, input: wInput } = makeField(t.image.widthPrompt, opts.width);
  const { row: hRow, input: hInput } = makeField(t.image.heightPrompt, opts.height);

  let checkboxEl: HTMLInputElement | null = null;

  const actions = document.createElement('div');
  actions.className = 'resize-dlg__actions';

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'resize-dlg__btn resize-dlg__btn--secondary';
  cancelBtn.textContent = t.saveDialog.cancel;
  cancelBtn.type = 'button';

  const confirmBtn = document.createElement('button');
  confirmBtn.className = 'resize-dlg__btn resize-dlg__btn--primary';
  confirmBtn.textContent = 'OK';
  confirmBtn.type = 'button';

  actions.append(cancelBtn, confirmBtn);

  dialog.append(titleEl, wRow, hRow);

  if (opts.checkboxLabel !== undefined) {
    const checkboxRow = document.createElement('label');
    checkboxRow.className = 'resize-dlg__checkbox-row';
    checkboxEl = document.createElement('input');
    checkboxEl.type = 'checkbox';
    checkboxEl.checked = opts.checkboxChecked ?? true;
    const lbl = document.createElement('span');
    lbl.textContent = opts.checkboxLabel;
    checkboxRow.append(checkboxEl, lbl);
    dialog.append(checkboxRow);
  }

  dialog.append(actions);
  backdrop.append(dialog);
  document.body.append(backdrop);

  wInput.focus();
  wInput.select();

  function close(): void {
    backdrop.remove();
  }

  function confirm(): void {
    const w = parseInt(wInput.value, 10);
    const h = parseInt(hInput.value, 10);
    if (w > 0 && h > 0) {
      close();
      opts.onConfirm(w, h, checkboxEl?.checked ?? false);
    }
  }

  cancelBtn.addEventListener('click', close);
  confirmBtn.addEventListener('click', confirm);

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) close();
  });

  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
    if (e.key === 'Enter') confirm();
  });
}
