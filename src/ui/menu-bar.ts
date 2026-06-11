import { parseWdraftBinary } from '../core/project-file';
import { lang, setLang, t } from '../core/i18n';
import { modKey } from '../core/platform';
import { openShortcutsDialog } from './shortcuts-dialog';
import type { WebDraftEditor } from '../core/webdraft-editor';
import {Lang, Menu, MenuItem} from '../types';
import type { StatusReporter } from '../types';
import { getErrorMessage } from './status-toasts';
import { saveStateForReload } from './lang-state';
import { openResizeDialog } from './resize-dialog';

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

  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*,.wdraft';
  fileInput.className = 'visually-hidden';
  fileInput.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    void (async () => {
      try {
        if (file.name.endsWith('.wdraft')) {
          const buffer = await file.arrayBuffer();
          const parsed = parseWdraftBinary(buffer);
          await editor.importProject(parsed);
          status.show(t.file.openedOk, 'success');
        } else {
          await editor.importImage(file);
          status.show(t.file.importedOk, 'success');
        }
      } catch (err) {
        status.show(getErrorMessage(err), 'error');
      } finally {
        fileInput.value = '';
      }
    })();
  });

  bar.append(fileInput);

  const menus: Menu[] = [
    {
      label: t.menu.file,
      items: [
        {
          type: 'action',
          label: t.file.new,
          shortcut: `${modKey}+N`,
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
          shortcut: `${modKey}+O`,
          action: () => fileInput.click(),
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
          shortcut: `${modKey}+Z`,
          disabled: () => !editor.canUndo,
          action: () => editor.undo(),
        },
        {
          type: 'action',
          label: t.edit.redo,
          shortcut: `${modKey}+Y`,
          disabled: () => !editor.canRedo,
          action: () => editor.redo(),
        },
        { type: 'separator' },
        {
          type: 'action',
          label: t.edit.cut,
          shortcut: `${modKey}+X`,
          action: () => editor.cutSelection(),
        },
        {
          type: 'action',
          label: t.edit.copy,
          shortcut: `${modKey}+C`,
          action: () => editor.copySelection(),
        },
        {
          type: 'action',
          label: t.edit.paste,
          shortcut: `${modKey}+V`,
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
            openResizeDialog({
              title: t.image.resizeCanvas,
              width: editor.canvasWidth,
              height: editor.canvasHeight,
              checkboxLabel: t.image.applyToAllLayers,
              checkboxChecked: true,
              onConfirm: (w, h, all) => {
                editor.resizeCanvas(w, h, all);
                status.show(t.image.resizedOk(w, h), 'success');
              },
            });
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
        { type: 'separator' },
        {
          type: 'action',
          label: t.layer.resize,
          action: () => {
            openResizeDialog({
              title: t.layer.resize,
              width: editor.activeLayerWidth,
              height: editor.activeLayerHeight,
              onConfirm: (w, h) => {
                editor.resizeActiveLayer(w, h);
                status.show(t.layer.layerResizedOk(w, h), 'success');
              },
            });
          },
        },
      ],
    },
    {
      label: t.menu.help,
      items: [
        {
          type: 'action',
          label: t.help.keyboardShortcuts,
          shortcut: `${modKey}+H`,
          action: openShortcutsDialog,
        },
      ],
    },
  ];

  for (const menu of menus) {
    bar.append(createMenuButton(menu));
  }

  bar.append(createZoomWidget(editor), createLangSelector(editor));

  document.addEventListener('click', closeOpenMenu);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeOpenMenu();
  });

  return bar;
}

function createZoomWidget(editor: WebDraftEditor): HTMLElement {
  const wrap = document.createElement('div');
  wrap.className = 'menu-zoom';

  const btnOut = document.createElement('button');
  btnOut.type = 'button';
  btnOut.className = 'menu-zoom-btn';
  btnOut.textContent = '−';
  btnOut.title = `Zoom out (${modKey}+−)`;
  btnOut.addEventListener('click', () => editor.zoomOut());

  const label = document.createElement('button');
  label.type = 'button';
  label.className = 'menu-zoom-label';
  label.title = `Reset zoom (${modKey}+0)`;
  label.addEventListener('click', () => editor.setZoom(1));

  const btnIn = document.createElement('button');
  btnIn.type = 'button';
  btnIn.className = 'menu-zoom-btn';
  btnIn.textContent = '+';
  btnIn.title = `Zoom in (${modKey}+=)`;
  btnIn.addEventListener('click', () => editor.zoomIn());

  wrap.append(btnOut, label, btnIn);

  const sync = (): void => {
    const pct = Math.round(editor.state.zoom * 100);
    label.textContent = `${pct}%`;
    btnOut.disabled = editor.state.zoom <= 0.1;
    btnIn.disabled = editor.state.zoom >= 8;
  };

  editor.addEventListener('change', sync);
  sync();

  return wrap;
}
