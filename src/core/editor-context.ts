import type {LayerDocumentSnapshot, LayerManager} from './layer-manager';
import type {EditorState} from './types';

export type HistorySnapshot = {
  canvasWidth: number;
  canvasHeight: number;
  document: LayerDocumentSnapshot;
};

export type EditorServices = {
  readonly state: EditorState;
  readonly layerManager: LayerManager;
  readonly previewContext: CanvasRenderingContext2D;
  readonly previewCanvas: HTMLCanvasElement;
  readonly root: HTMLElement;
  captureSnapshot(): HistorySnapshot;
  pushHistory(before: HistorySnapshot, after: HistorySnapshot): void;
  clearPreview(): void;
  dispatchChange(): void;
};
