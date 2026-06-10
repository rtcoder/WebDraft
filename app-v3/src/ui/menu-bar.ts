import { parseWdraftBinary } from '../core/project-file';
import { lang, setLang, t } from '../core/i18n';
import type { Lang } from '../core/i18n';
import type { WebDraftEditor } from '../core/webdraft-editor';
import type { StatusReporter } from './status-toasts';
import { getErrorMessage } from './status-toasts';
import { saveStateForReload } from './lang-state';

type MenuItem =
  | { type: 'action'; label: string; action: () => void; shortcut?: string; disabled?: () => boolean }
  | { type: 'separator' };

type Menu = { label: string; items: MenuItem[] };

let openMenu: HTMLElement | null = null;
let openButton: HTMLButtonElement | null = null;

function closeOpenMenu(): void {
  openMenu?.remove();
  openMenu = null;
  openButton?.classList.remove('menu-btn--active');
  openButton = null;
}

function buildDropdown(items: MenuItem[], anchorEl: HTMLElement): HTMLElement {
  const dropdown = document.createElement('ul');
  dropdown.className = 'menu-dropdown';
  dropdown.setAttribute('role', 'menu');

  for (const item of items) {
    const li = document.createElement('li');
    li.setAttribute('role', 'none');

    if (item.type === 'separator') {
      li.className = 'menu-dropdown__sep';
      li.setAttribute('role', 'separator');
    } else {
      li.className = 'menu-dropdown__item';
      if (item.disabled?.()) li.classList.add('menu-dropdown__item--disabled');

      const btn = document.createElement('button');
      btn.setAttribute('role', 'menuitem');
      btn.tabIndex = -1;
      btn.textContent = item.label;

      if (item.shortcut) {
        const kbd = document.createElement('span');
        kbd.className = 'menu-dropdown__shortcut';
        kbd.textContent = item.shortcut;
        btn.append(kbd);
      }

      btn.addEventListener('click', () => {
        if (!item.disabled?.()) {
          closeOpenMenu();
          item.action();
        }
      });
      li.append(btn);
    }

    dropdown.append(li);
  }

  const rect = anchorEl.getBoundingClientRect();
  dropdown.style.left = `${rect.left}px`;
  dropdown.style.top = `${rect.bottom}px`;

  return dropdown;
}

function createMenuButton(menu: Menu): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.className = 'menu-btn';
  btn.textContent = menu.label;
  btn.setAttribute('aria-haspopup', 'true');
  btn.setAttribute('aria-expanded', 'false');

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (openMenu && openButton === btn) {
      closeOpenMenu();
      return;
    }
    closeOpenMenu();

    const dropdown = buildDropdown(menu.items, btn);
    document.body.append(dropdown);
    openMenu = dropdown;
    openButton = btn;
    btn.classList.add('menu-btn--active');
    btn.setAttribute('aria-expanded', 'true');
  });

  btn.addEventListener('mouseenter', () => {
    if (openMenu && openButton !== btn) {
      closeOpenMenu();
      const dropdown = buildDropdown(menu.items, btn);
      document.body.append(dropdown);
      openMenu = dropdown;
      openButton = btn;
      btn.classList.add('menu-btn--active');
      btn.setAttribute('aria-expanded', 'true');
    }
  });

  return btn;
}

const LANG_LABELS: Record<Lang, string> = {
  pl: '🇵🇱 PL',
  en: '🇬🇧 EN',
};

const ALL_LANGS: Lang[] = ['pl', 'en'];

function createLangSelector(editor: WebDraftEditor): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'menu-lang-selector';

  const btn = document.createElement('button');
  btn.className = 'menu-btn menu-lang-btn';
  btn.textContent = LANG_LABELS[lang];
  btn.setAttribute('aria-haspopup', 'true');
  btn.setAttribute('aria-expanded', 'false');

  let dropdown: HTMLElement | null = null;

  function closeLangMenu(): void {
    dropdown?.remove();
    dropdown = null;
    btn.classList.remove('menu-btn--active');
    btn.setAttribute('aria-expanded', 'false');
  }

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (dropdown) { closeLangMenu(); return; }

    closeOpenMenu();

    dropdown = document.createElement('ul');
    dropdown.className = 'menu-dropdown menu-lang-dropdown';
    dropdown.setAttribute('role', 'menu');

    for (const l of ALL_LANGS) {
      const li = document.createElement('li');
      li.setAttribute('role', 'none');
      li.className = 'menu-dropdown__item' + (l === lang ? ' menu-dropdown__item--active' : '');

      const item = document.createElement('button');
      item.setAttribute('role', 'menuitem');
      item.tabIndex = -1;
      item.textContent = LANG_LABELS[l];
      item.addEventListener('click', () => {
        closeLangMenu();
        if (l !== lang) {
          void saveStateForReload(editor).then(() => {
            setLang(l);
            location.reload();
          });
        }
      });

      li.append(item);
      dropdown.append(li);
    }

    const rect = btn.getBoundingClientRect();
    dropdown.style.left = `${rect.right}px`;
    dropdown.style.top = `${rect.bottom}px`;
    dropdown.style.transform = 'translateX(-100%)';

    document.body.append(dropdown);
    btn.classList.add('menu-btn--active');
    btn.setAttribute('aria-expanded', 'true');

    document.addEventListener('click', closeLangMenu, { once: true });
  });

  wrapper.append(btn);
  return wrapper;
}

export function createMenuBar(editor: WebDraftEditor, status: StatusReporter): HTMLElement {
  const bar = document.createElement('nav');
  bar.className = 'menu-bar';
  bar.setAttribute('aria-label', t.menu.file);

  const projectInput = document.createElement('input');
  projectInput.type = 'file';
  projectInput.accept = '.wdraft';
  projectInput.className = 'visually-hidden';
  projectInput.addEventListener('change', () => {
    const file = projectInput.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      void (async () => {
        try {
          const parsed = parseWdraftBinary(reader.result as ArrayBuffer);
          await editor.importProject(parsed);
          status.show(t.file.openedOk, 'success');
        } catch (err) {
          status.show(getErrorMessage(err), 'error');
        } finally {
          projectInput.value = '';
        }
      })();
    };
    reader.readAsArrayBuffer(file);
  });

  const imageInput = document.createElement('input');
  imageInput.type = 'file';
  imageInput.accept = 'image/*';
  imageInput.className = 'visually-hidden';
  imageInput.addEventListener('change', () => {
    const file = imageInput.files?.[0];
    if (!file) return;
    void (async () => {
      try {
        await editor.importImage(file);
        status.show(t.file.importedOk, 'success');
      } catch (err) {
        status.show(getErrorMessage(err), 'error');
      } finally {
        imageInput.value = '';
      }
    })();
  });

  bar.append(projectInput, imageInput);

  const menus: Menu[] = [
    {
      label: t.menu.file,
      items: [
        {
          type: 'action',
          label: t.file.new,
          shortcut: 'Ctrl+N',
          action: () => {
            if (confirm(t.file.newConfirm)) {
              editor.clear();
              status.show(t.file.new, 'success');
            }
          },
        },
        {
          type: 'action',
          label: t.file.open,
          shortcut: 'Ctrl+O',
          action: () => projectInput.click(),
        },
        { type: 'separator' },
        {
          type: 'action',
          label: t.file.save,
          action: () => {
            void (async () => {
              try {
                const blob = await editor.exportProject();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = t.file.projectFilename;
                a.click();
                URL.revokeObjectURL(url);
                status.show(t.file.savedOk, 'success');
              } catch (err) {
                status.show(getErrorMessage(err), 'error');
              }
            })();
          },
        },
        { type: 'separator' },
        {
          type: 'action',
          label: t.file.importImage,
          action: () => imageInput.click(),
        },
        {
          type: 'action',
          label: t.file.exportPng,
          action: () => {
            void (async () => {
              try {
                const blob = await editor.exportPng();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = t.file.imageFilename;
                a.click();
                URL.revokeObjectURL(url);
                status.show(t.file.exportedOk, 'success');
              } catch (err) {
                status.show(getErrorMessage(err), 'error');
              }
            })();
          },
        },
      ],
    },
    {
      label: t.menu.edit,
      items: [
        {
          type: 'action',
          label: t.edit.undo,
          shortcut: 'Ctrl+Z',
          disabled: () => !editor.canUndo,
          action: () => editor.undo(),
        },
        {
          type: 'action',
          label: t.edit.redo,
          shortcut: 'Ctrl+Y',
          disabled: () => !editor.canRedo,
          action: () => editor.redo(),
        },
        { type: 'separator' },
        {
          type: 'action',
          label: t.edit.cut,
          shortcut: 'Ctrl+X',
          action: () => editor.cutSelection(),
        },
        {
          type: 'action',
          label: t.edit.copy,
          shortcut: 'Ctrl+C',
          action: () => editor.copySelection(),
        },
        {
          type: 'action',
          label: t.edit.paste,
          shortcut: 'Ctrl+V',
          action: () => editor.pasteSelection(),
        },
        { type: 'separator' },
        {
          type: 'action',
          label: t.edit.clearLayer,
          action: () => editor.clear(),
        },
      ],
    },
    {
      label: t.menu.image,
      items: [
        {
          type: 'action',
          label: t.image.resizeCanvas,
          action: () => {
            const w = prompt(t.image.widthPrompt, '900');
            const h = prompt(t.image.heightPrompt, '620');
            const nw = parseInt(w ?? '', 10);
            const nh = parseInt(h ?? '', 10);
            if (nw > 0 && nh > 0) {
              editor.resizeCanvas(nw, nh);
              status.show(t.image.resizedOk(nw, nh), 'success');
            }
          },
        },
        { type: 'separator' },
        {
          type: 'action',
          label: t.image.invertColors,
          action: () => editor.invertActiveLayer(),
        },
        {
          type: 'action',
          label: t.image.mirrorH,
          action: () => editor.mirrorActiveLayer('horizontal'),
        },
        {
          type: 'action',
          label: t.image.mirrorV,
          action: () => editor.mirrorActiveLayer('vertical'),
        },
        { type: 'separator' },
        {
          type: 'action',
          label: t.image.rotateLeft,
          action: () => editor.rotateActiveLayer('left'),
        },
        {
          type: 'action',
          label: t.image.rotateRight,
          action: () => editor.rotateActiveLayer('right'),
        },
      ],
    },
    {
      label: t.menu.layer,
      items: [
        {
          type: 'action',
          label: t.layer.new,
          action: () => {
            editor.addLayer();
            status.show(t.layer.addedOk, 'success');
          },
        },
        {
          type: 'action',
          label: t.layer.delete,
          disabled: () => editor.layers.length <= 1,
          action: () => {
            editor.deleteActiveLayer();
            status.show(t.layer.deletedOk, 'success');
          },
        },
        { type: 'separator' },
        {
          type: 'action',
          label: t.layer.moveUp,
          action: () => editor.moveActiveLayerUp(),
        },
        {
          type: 'action',
          label: t.layer.moveDown,
          action: () => editor.moveActiveLayerDown(),
        },
      ],
    },
  ];

  for (const menu of menus) {
    bar.append(createMenuButton(menu));
  }

  bar.append(createLangSelector(editor));

  document.addEventListener('click', closeOpenMenu);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeOpenMenu();
  });

  return bar;
}
