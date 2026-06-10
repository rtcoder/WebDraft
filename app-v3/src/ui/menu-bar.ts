import { parseWdraftBinary } from '../core/project-file';
import type { WebDraftEditor } from '../core/webdraft-editor';
import type { StatusReporter } from './status-toasts';
import { getErrorMessage } from './status-toasts';

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

export function createMenuBar(editor: WebDraftEditor, status: StatusReporter): HTMLElement {
  const bar = document.createElement('nav');
  bar.className = 'menu-bar';
  bar.setAttribute('aria-label', 'Main menu');

  const plikInput = document.createElement('input');
  plikInput.type = 'file';
  plikInput.accept = '.wdraft';
  plikInput.className = 'visually-hidden';
  plikInput.addEventListener('change', () => {
    const file = plikInput.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      void (async () => {
        try {
          const parsed = parseWdraftBinary(reader.result as ArrayBuffer);
          await editor.importProject(parsed);
          status.show('Projekt otwarty.', 'success');
        } catch (err) {
          status.show(getErrorMessage(err), 'error');
        } finally {
          plikInput.value = '';
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
        status.show('Obraz zaimportowany.', 'success');
      } catch (err) {
        status.show(getErrorMessage(err), 'error');
      } finally {
        imageInput.value = '';
      }
    })();
  });

  bar.append(plikInput, imageInput);

  const menus: Menu[] = [
    {
      label: 'Plik',
      items: [
        {
          type: 'action',
          label: 'Nowy projekt',
          shortcut: 'Ctrl+N',
          action: () => {
            if (confirm('Nowy projekt? Niezapisane zmiany zostaną utracone.')) {
              editor.clear();
              status.show('Nowy projekt.', 'success');
            }
          },
        },
        {
          type: 'action',
          label: 'Otwórz projekt…',
          shortcut: 'Ctrl+O',
          action: () => plikInput.click(),
        },
        { type: 'separator' },
        {
          type: 'action',
          label: 'Zapisz projekt',
          shortcut: 'Ctrl+S',
          action: () => {
            void (async () => {
              try {
                const blob = await editor.exportProject();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'projekt.wdraft';
                a.click();
                URL.revokeObjectURL(url);
                status.show('Projekt zapisany.', 'success');
              } catch (err) {
                status.show(getErrorMessage(err), 'error');
              }
            })();
          },
        },
        { type: 'separator' },
        {
          type: 'action',
          label: 'Importuj obraz…',
          action: () => imageInput.click(),
        },
        {
          type: 'action',
          label: 'Eksportuj PNG',
          shortcut: 'Ctrl+Shift+E',
          action: () => {
            void (async () => {
              try {
                const blob = await editor.exportPng();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'obraz.png';
                a.click();
                URL.revokeObjectURL(url);
                status.show('PNG wyeksportowany.', 'success');
              } catch (err) {
                status.show(getErrorMessage(err), 'error');
              }
            })();
          },
        },
      ],
    },
    {
      label: 'Edycja',
      items: [
        {
          type: 'action',
          label: 'Cofnij',
          shortcut: 'Ctrl+Z',
          disabled: () => !editor.canUndo,
          action: () => editor.undo(),
        },
        {
          type: 'action',
          label: 'Ponów',
          shortcut: 'Ctrl+Y',
          disabled: () => !editor.canRedo,
          action: () => editor.redo(),
        },
        { type: 'separator' },
        {
          type: 'action',
          label: 'Wytnij',
          shortcut: 'Ctrl+X',
          action: () => editor.cutSelection(),
        },
        {
          type: 'action',
          label: 'Kopiuj',
          shortcut: 'Ctrl+C',
          action: () => editor.copySelection(),
        },
        {
          type: 'action',
          label: 'Wklej',
          shortcut: 'Ctrl+V',
          action: () => editor.pasteSelection(),
        },
        { type: 'separator' },
        {
          type: 'action',
          label: 'Wyczyść warstwę',
          action: () => editor.clear(),
        },
      ],
    },
    {
      label: 'Obraz',
      items: [
        {
          type: 'action',
          label: 'Zmień rozmiar płótna…',
          action: () => {
            const w = prompt('Szerokość (px):', '900');
            const h = prompt('Wysokość (px):', '620');
            const nw = parseInt(w ?? '', 10);
            const nh = parseInt(h ?? '', 10);
            if (nw > 0 && nh > 0) {
              editor.resizeCanvas(nw, nh);
              status.show(`Płótno: ${nw}×${nh}`, 'success');
            }
          },
        },
        { type: 'separator' },
        {
          type: 'action',
          label: 'Odwróć kolory',
          action: () => editor.invertActiveLayer(),
        },
        {
          type: 'action',
          label: 'Lustro poziome',
          action: () => editor.mirrorActiveLayer('horizontal'),
        },
        {
          type: 'action',
          label: 'Lustro pionowe',
          action: () => editor.mirrorActiveLayer('vertical'),
        },
        { type: 'separator' },
        {
          type: 'action',
          label: 'Obróć w lewo',
          action: () => editor.rotateActiveLayer('left'),
        },
        {
          type: 'action',
          label: 'Obróć w prawo',
          action: () => editor.rotateActiveLayer('right'),
        },
      ],
    },
    {
      label: 'Warstwa',
      items: [
        {
          type: 'action',
          label: 'Nowa warstwa',
          action: () => {
            editor.addLayer();
            status.show('Warstwa dodana.', 'success');
          },
        },
        {
          type: 'action',
          label: 'Usuń warstwę',
          disabled: () => editor.layers.length <= 1,
          action: () => {
            editor.deleteActiveLayer();
            status.show('Warstwa usunięta.', 'success');
          },
        },
        { type: 'separator' },
        {
          type: 'action',
          label: 'Przesuń warstwę w górę',
          action: () => editor.moveActiveLayerUp(),
        },
        {
          type: 'action',
          label: 'Przesuń warstwę w dół',
          action: () => editor.moveActiveLayerDown(),
        },
      ],
    },
  ];

  for (const menu of menus) {
    bar.append(createMenuButton(menu));
  }

  document.addEventListener('click', closeOpenMenu);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeOpenMenu();
  });

  return bar;
}
