import {t} from '../core/i18n';
import type {WebDraftEditor} from '../core/webdraft-editor.ts';
import type {StatusReporter} from './status-toasts.ts';

type Filters = {
  sepia: boolean;
  noise: boolean;
  greyscale: boolean;
  negative: boolean;
};

function applyFilters(data: Uint8ClampedArray, filters: Filters): void {
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    if (filters.greyscale || filters.sepia) {
      const avg = 0.3 * r + 0.59 * g + 0.11 * b;
      r = filters.sepia ? avg + 100 : avg;
      g = filters.sepia ? avg + 50 : avg;
      b = filters.sepia ? avg : avg;
    }

    if (filters.negative) {
      r = 255 - r;
      g = 255 - g;
      b = 255 - b;
    }

    if (filters.noise) {
      const rand = (Math.random() - 0.5) * 100;
      r = Math.max(0, Math.min(255, r + rand));
      g = Math.max(0, Math.min(255, g + rand));
      b = Math.max(0, Math.min(255, b + rand));
    }

    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }
}

function createFilterCheckbox(label: string, onChange: (checked: boolean) => void): HTMLLabelElement {
  const el = document.createElement('label');
  el.className = 'checkbox-control';

  const input = document.createElement('input');
  input.type = 'checkbox';
  input.addEventListener('change', () => onChange(input.checked));

  const text = document.createElement('span');
  text.textContent = label;
  el.append(input, text);

  return el;
}

export function openCameraPanel(editor: WebDraftEditor, status: StatusReporter): void {
  const mediaDevices = navigator.mediaDevices;

  if (!mediaDevices?.getUserMedia) {
    status.show(t.camera.unavailable, 'error');
    return;
  }

  const filters: Filters = {sepia: false, noise: false, greyscale: false, negative: false};
  let stream: MediaStream | null = null;
  let rafId = 0;
  let isSnapped = false;
  let snapshotCanvas: HTMLCanvasElement | null = null;

  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;

  const backdrop = document.createElement('div');
  backdrop.className = 'camera-panel-backdrop';

  const panel = document.createElement('div');
  panel.className = 'camera-panel';

  // Header
  const header = document.createElement('div');
  header.className = 'camera-panel__header';

  const title = document.createElement('span');
  title.className = 'camera-panel__title';
  title.textContent = t.camera.title;

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'camera-panel__close command-button';
  closeBtn.textContent = '✕';
  closeBtn.addEventListener('click', closePanel);

  header.append(title, closeBtn);

  // Preview canvas
  const previewCanvas = document.createElement('canvas');
  previewCanvas.className = 'camera-panel__canvas';

  // Filters
  const filtersContainer = document.createElement('div');
  filtersContainer.className = 'camera-panel__filters';

  const filterDefs: Array<{label: string; key: keyof Filters}> = [
    {label: t.camera.sepia, key: 'sepia'},
    {label: t.camera.noise, key: 'noise'},
    {label: t.camera.greyscale, key: 'greyscale'},
    {label: t.camera.negative, key: 'negative'},
  ];

  for (const {label, key} of filterDefs) {
    filtersContainer.append(createFilterCheckbox(label, (checked) => {
      filters[key] = checked;
    }));
  }

  // Actions
  const actionsContainer = document.createElement('div');
  actionsContainer.className = 'camera-panel__actions';

  const snapBtn = document.createElement('button');
  snapBtn.type = 'button';
  snapBtn.className = 'command-button';
  snapBtn.textContent = t.camera.snap;
  snapBtn.addEventListener('click', doSnap);

  const snapToCanvasBtn = document.createElement('button');
  snapToCanvasBtn.type = 'button';
  snapToCanvasBtn.className = 'command-button';
  snapToCanvasBtn.textContent = t.camera.snapToCanvas;
  snapToCanvasBtn.addEventListener('click', doSnapToCanvas);

  const applyBtn = document.createElement('button');
  applyBtn.type = 'button';
  applyBtn.className = 'command-button';
  applyBtn.textContent = t.camera.applyToCanvas;
  applyBtn.addEventListener('click', doApply);

  const saveBtn = document.createElement('button');
  saveBtn.type = 'button';
  saveBtn.className = 'command-button';
  saveBtn.textContent = t.camera.saveToFile;
  saveBtn.addEventListener('click', doSave);

  const backBtn = document.createElement('button');
  backBtn.type = 'button';
  backBtn.className = 'command-button';
  backBtn.textContent = t.camera.backToLive;
  backBtn.addEventListener('click', resumeLive);

  showLiveActions();

  panel.append(header, previewCanvas, filtersContainer, actionsContainer);
  document.body.append(backdrop, panel);

  // Keyboard: Escape closes panel
  function onKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      e.preventDefault();
      closePanel();
    }
  }
  document.addEventListener('keydown', onKeyDown);

  // Start camera
  void startCamera();

  async function startCamera(): Promise<void> {
    try {
      stream = await mediaDevices.getUserMedia({video: true});
      video.srcObject = stream;

      await new Promise<void>((resolve) => {
        video.addEventListener('loadedmetadata', () => resolve(), {once: true});
        void video.play();
      });

      const track = stream.getVideoTracks()[0];
      if (track?.label) {
        title.textContent = t.camera.titleWithLabel(track.label);
      }

      previewCanvas.width = video.videoWidth;
      previewCanvas.height = video.videoHeight;

      startLiveLoop();
    } catch (error) {
      closePanel();
      status.show(error instanceof Error ? error.message : t.camera.cameraError, 'error');
    }
  }

  function startLiveLoop(): void {
    const ctx = previewCanvas.getContext('2d');
    if (!ctx) return;

    function frame(): void {
      if (isSnapped) return;
      ctx!.drawImage(video, 0, 0);
      const hasActiveFilter = filters.sepia || filters.noise || filters.greyscale || filters.negative;
      if (hasActiveFilter) {
        const imageData = ctx!.getImageData(0, 0, previewCanvas.width, previewCanvas.height);
        applyFilters(imageData.data, filters);
        ctx!.putImageData(imageData, 0, 0);
      }
      rafId = requestAnimationFrame(frame);
    }

    rafId = requestAnimationFrame(frame);
  }

  function doSnap(): void {
    cancelAnimationFrame(rafId);
    isSnapped = true;

    snapshotCanvas = document.createElement('canvas');
    snapshotCanvas.width = previewCanvas.width;
    snapshotCanvas.height = previewCanvas.height;
    const snapCtx = snapshotCanvas.getContext('2d');
    snapCtx?.drawImage(previewCanvas, 0, 0);

    showSnappedActions();
  }

  function resumeLive(): void {
    isSnapped = false;
    snapshotCanvas = null;
    showLiveActions();
    startLiveLoop();
  }

  function doApply(): void {
    if (!snapshotCanvas) return;
    editor.importCanvasAsLayer(snapshotCanvas);
    status.show(t.camera.frameAdded, 'success');
    closePanel();
  }

  function doSave(): void {
    if (!snapshotCanvas) return;
    snapshotCanvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = t.camera.snapFilename;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  function doSnapToCanvas(): void {
    const tmp = document.createElement('canvas');
    tmp.width = previewCanvas.width;
    tmp.height = previewCanvas.height;
    tmp.getContext('2d')?.drawImage(previewCanvas, 0, 0);
    editor.importCanvasAsLayer(tmp);
    status.show(t.camera.frameAdded, 'success');
  }

  function showLiveActions(): void {
    actionsContainer.replaceChildren(snapBtn, snapToCanvasBtn);
  }

  function showSnappedActions(): void {
    actionsContainer.replaceChildren(applyBtn, saveBtn, backBtn);
  }

  function closePanel(): void {
    cancelAnimationFrame(rafId);
    document.removeEventListener('keydown', onKeyDown);
    stream?.getTracks().forEach((t) => t.stop());
    video.srcObject = null;
    panel.remove();
    backdrop.remove();
  }
}
