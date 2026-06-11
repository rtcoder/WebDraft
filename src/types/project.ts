import type {TextLayerData} from './core';

export type WdraftLayerMeta = {
  id: string;
  name: string;
  visible: boolean;
  width: number;
  height: number;
  textData?: TextLayerData;
};

export type WdraftFileMeta = {
  version: number;
  canvasWidth: number;
  canvasHeight: number;
  activeLayerId: string;
  layerCount: number;
  layers: WdraftLayerMeta[];
};

export type ParsedWdraftFile = {
  meta: WdraftFileMeta;
  pngBuffers: Uint8Array[];
};
