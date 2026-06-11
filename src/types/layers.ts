import type {TextLayerData} from './core';

export type Layer = {
  id: string;
  name: string;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  visible: boolean;
  x: number;
  y: number;
  textData?: TextLayerData;
};

export type LayerSummary = {
  id: string;
  name: string;
  active: boolean;
  preview: string;
  visible: boolean;
  isTextLayer: boolean;
};

type LayerSnapshot = {
  layerId: string;
  imageData: ImageData;
};

type LayerSnapshotWithMetadata = LayerSnapshot & {
  name: string;
  visible: boolean;
  x: number;
  y: number;
  textData?: TextLayerData;
};

export type LayerDocumentSnapshot = {
  activeLayerId: string;
  layerCount: number;
  layers: LayerSnapshotWithMetadata[];
};
