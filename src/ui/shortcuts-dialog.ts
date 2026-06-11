import {t} from '../core/i18n';
import {modKey} from '../core/platform';

type ShortcutRow = [string, string];
type Section = {title: string; rows: ShortcutRow[]};

function toolLabel(s: string): string {
  return s.split(' \u2014 ')[0].trim();
}

export function openShortcutsDialog(): void {
  if (document.querySelector('.shortcuts-dialog')) return;

  const backdrop = document.createElement('div');
  backdrop.className = 'shortcuts-dialog-backdrop';

  const dialog = document.createElement('div');
  dialog.className = 'shortcuts-dialog';
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-label', t.help.keyboardShortcuts);

  const header = document.createElement('div');
  header.className = 'shortcuts-dialog__header';

  const title = document.createElement('h2');
  title.className = 'shortcuts-dialog__title';
  title.textContent = t.help.keyboardShortcuts;

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'shortcuts-dialog__close';
  closeBtn.textContent = '\u00d7';
  closeBtn.title = t.help.close;
  header.append(title, closeBtn);

  const sections: Section[] = [
    {
      title: t.menu.file,
      rows: [
        [`${modKey}+N`, t.file.new],
        [`${modKey}+O`, t.file.open],
        [`${modKey}+S`, t.file.save],
      ],
    },
    {
      title: t.menu.edit,
      rows: [
        [`${modKey}+Z`, t.edit.undo],
        [`${modKey}+Shift+Z`, t.edit.redo],
        [`${modKey}+C`, t.edit.copy],
        [`${modKey}+X`, t.edit.cut],
        [`${modKey}+V`, t.edit.paste],
        ['Delete', t.edit.clearLayer],
      ],
    },
    {
      title: t.help.sectionView,
      rows: [
        [`${modKey}+=`, t.help.zoomIn],
        [`${modKey}+\u2212`, t.help.zoomOut],
        [`${modKey}+0`, t.help.zoomReset],
      ],
    },
    {
      title: t.help.sectionTools,
      rows: [
        ['S', toolLabel(t.toolbar.toolSelect)],
        ['P', toolLabel(t.toolbar.toolPencil)],
        ['E', toolLabel(t.toolbar.toolEraser)],
        ['C', toolLabel(t.toolbar.toolSampler)],
        ['B', toolLabel(t.toolbar.toolFillBucket)],
        ['W', toolLabel(t.toolbar.toolWeb)],
        ['R', toolLabel(t.toolbar.toolRectangle)],
        ['O', toolLabel(t.toolbar.toolEllipse)],
        ['T', toolLabel(t.toolbar.toolText)],
      ],
    },
    {
      title: t.help.sectionCanvas,
      rows: [
        ['I', toolLabel(t.toolbar.invertColors)],
        ['H', toolLabel(t.toolbar.mirrorH)],
        ['V', toolLabel(t.toolbar.mirrorV)],
        [',', toolLabel(t.toolbar.rotateLeft)],
        ['.', toolLabel(t.toolbar.rotateRight)],
        ['[', t.help.sizeDecrease],
        [']', t.help.sizeIncrease],
      ],
    },
  ];

  const body = document.createElement('div');
  body.className = 'shortcuts-dialog__body';

  for (const section of sections) {
    const col = document.createElement('div');
    col.className = 'shortcuts-section';

    const sectionTitle = document.createElement('h3');
    sectionTitle.className = 'shortcuts-section__title';
    sectionTitle.textContent = section.title;

    const rows = document.createElement('div');
    rows.className = 'shortcuts-section__rows';

    for (const [key, desc] of section.rows) {
      const row = document.createElement('div');
      row.className = 'shortcuts-row';

      const kbd = document.createElement('kbd');
      kbd.className = 'shortcuts-row__key';
      kbd.textContent = key;

      const descEl = document.createElement('span');
      descEl.className = 'shortcuts-row__desc';
      descEl.textContent = desc;

      row.append(kbd, descEl);
      rows.append(row);
    }

    col.append(sectionTitle, rows);
    body.append(col);
  }

  dialog.append(header, body);
  document.body.append(backdrop, dialog);

  function close(): void {
    backdrop.remove();
    dialog.remove();
    document.removeEventListener('keydown', onKey);
  }

  function onKey(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    }
  }

  closeBtn.addEventListener('click', close);
  backdrop.addEventListener('click', close);
  document.addEventListener('keydown', onKey);
  closeBtn.focus();
}
