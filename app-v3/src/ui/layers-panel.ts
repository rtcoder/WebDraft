import type { WebDraftEditor } from '../core/webdraft-editor';

export function createLayersPanel(editor: WebDraftEditor): HTMLElement {
  const panel = document.createElement('section');
  panel.className = 'layers-panel';

  const header = document.createElement('div');
  header.className = 'panel-header';

  const title = document.createElement('h2');
  title.textContent = 'Layers';

  const actions = document.createElement('div');
  actions.className = 'panel-actions';

  const addButton = createIconButton('Add layer', '+', () => editor.addLayer());
  const deleteButton = createIconButton('Delete layer', '-', () => editor.deleteActiveLayer());
  const upButton = createIconButton('Move layer up', '↑', () => editor.moveActiveLayerUp());
  const downButton = createIconButton('Move layer down', '↓', () => editor.moveActiveLayerDown());

  actions.append(addButton, deleteButton, upButton, downButton);
  header.append(title, actions);

  const list = document.createElement('div');
  list.className = 'layer-list';

  const render = () => {
    list.replaceChildren(
      ...editor.layers.map((layer) => {
        const item = document.createElement('div');
        item.className = 'layer-item';
        item.classList.toggle('is-active', layer.active);

        const previewButton = document.createElement('button');
        previewButton.type = 'button';
        previewButton.className = 'layer-preview';
        previewButton.title = `Select ${layer.name}`;
        previewButton.addEventListener('click', () => editor.selectLayer(layer.id));

        const previewImage = document.createElement('img');
        previewImage.alt = '';
        previewImage.src = layer.preview;
        previewButton.append(previewImage);

        const renameInput = document.createElement('input');
        renameInput.className = 'layer-name-input';
        renameInput.value = layer.name;
        renameInput.title = 'Rename layer';
        renameInput.addEventListener('focus', () => {
          renameInput.select();
        });
        renameInput.addEventListener('blur', () => {
          editor.renameLayer(layer.id, renameInput.value);
        });
        renameInput.addEventListener('keydown', (event) => {
          if (event.key === 'Enter') {
            renameInput.blur();
          }
        });

        const visibilityButton = document.createElement('button');
        visibilityButton.type = 'button';
        visibilityButton.className = 'layer-visibility';
        visibilityButton.title = layer.visible ? 'Hide layer' : 'Show layer';
        visibilityButton.textContent = layer.visible ? '●' : '○';
        visibilityButton.addEventListener('click', () => editor.toggleLayerVisibility(layer.id));

        item.append(previewButton, renameInput, visibilityButton);

        return item;
      })
    );
  };

  editor.addEventListener('change', render);
  render();

  panel.append(header, list);

  return panel;
}

function createIconButton(label: string, icon: string, onClick: () => void): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'icon-button';
  button.title = label;
  button.textContent = icon;
  button.addEventListener('click', onClick);

  return button;
}
