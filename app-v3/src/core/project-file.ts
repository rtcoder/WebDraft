export const WDRAFT_VERSION = 1;
export const WDRAFT_MIME_TYPE = 'application/x-webdraft';
export const WDRAFT_EXTENSION = '.wdraft';

export type WdraftLayer = {
  id: string;
  name: string;
  visible: boolean;
  width: number;
  height: number;
  imageDataUrl: string;
};

export type WdraftFile = {
  version: number;
  canvasWidth: number;
  canvasHeight: number;
  activeLayerId: string;
  layerCount: number;
  layers: WdraftLayer[];
};

export function parseWdraftFile(text: string): WdraftFile {
  let data: unknown;

  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('Invalid .wdraft file: not valid JSON.');
  }

  if (typeof data !== 'object' || data === null) {
    throw new Error('Invalid .wdraft file: expected an object.');
  }

  const obj = data as Record<string, unknown>;

  if (typeof obj['version'] !== 'number') {
    throw new Error('Invalid .wdraft file: missing version.');
  }

  if (obj['version'] !== WDRAFT_VERSION) {
    throw new Error(`Unsupported .wdraft version: ${obj['version']}. Expected ${WDRAFT_VERSION}.`);
  }

  if (typeof obj['canvasWidth'] !== 'number' || typeof obj['canvasHeight'] !== 'number') {
    throw new Error('Invalid .wdraft file: missing canvasWidth or canvasHeight.');
  }

  if (typeof obj['activeLayerId'] !== 'string') {
    throw new Error('Invalid .wdraft file: missing activeLayerId.');
  }

  if (typeof obj['layerCount'] !== 'number') {
    throw new Error('Invalid .wdraft file: missing layerCount.');
  }

  if (!Array.isArray(obj['layers']) || obj['layers'].length === 0) {
    throw new Error('Invalid .wdraft file: layers must be a non-empty array.');
  }

  const layers: WdraftLayer[] = (obj['layers'] as unknown[]).map((item, index) => {
    if (typeof item !== 'object' || item === null) {
      throw new Error(`Invalid .wdraft file: layer ${index} is not an object.`);
    }
    const layer = item as Record<string, unknown>;
    if (
      typeof layer['id'] !== 'string' ||
      typeof layer['name'] !== 'string' ||
      typeof layer['visible'] !== 'boolean' ||
      typeof layer['width'] !== 'number' ||
      typeof layer['height'] !== 'number' ||
      typeof layer['imageDataUrl'] !== 'string'
    ) {
      throw new Error(`Invalid .wdraft file: layer ${index} is missing required fields.`);
    }
    return {
      id: layer['id'],
      name: layer['name'],
      visible: layer['visible'],
      width: layer['width'],
      height: layer['height'],
      imageDataUrl: layer['imageDataUrl'],
    };
  });

  return {
    version: obj['version'],
    canvasWidth: obj['canvasWidth'],
    canvasHeight: obj['canvasHeight'],
    activeLayerId: obj['activeLayerId'],
    layerCount: obj['layerCount'],
    layers,
  };
}
