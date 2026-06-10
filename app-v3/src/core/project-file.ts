export const WDRAFT_VERSION = 2;
export const WDRAFT_MAGIC = [0x57, 0x44, 0x46, 0x54] as const; // "WDFT"
export const WDRAFT_MIME_TYPE = 'application/x-webdraft';
export const WDRAFT_EXTENSION = '.wdraft';

export type WdraftLayerMeta = {
  id: string;
  name: string;
  visible: boolean;
  width: number;
  height: number;
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

const enc = new TextEncoder();
const dec = new TextDecoder();

export function serializeWdraftBinary(meta: WdraftFileMeta, pngBuffers: Uint8Array[]): Blob {
  const activeLayerIdBytes = enc.encode(meta.activeLayerId);
  const layerStrings = meta.layers.map((l) => ({
    id: enc.encode(l.id),
    name: enc.encode(l.name),
  }));

  // Calculate total size
  let size =
    4 + // magic
    1 + // version
    4 + // canvasWidth
    4 + // canvasHeight
    4 + // layerCount
    2 + activeLayerIdBytes.length + // activeLayerId
    2; // layer entries count

  for (let i = 0; i < meta.layers.length; i++) {
    size +=
      2 + layerStrings[i].id.length +
      2 + layerStrings[i].name.length +
      1 + // visible
      4 + // width
      4 + // height
      4 + pngBuffers[i].length; // png data length + data
  }

  const buffer = new ArrayBuffer(size);
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);

  let offset = 0;

  // Magic
  for (const byte of WDRAFT_MAGIC) {
    bytes[offset++] = byte;
  }

  // Version
  bytes[offset++] = WDRAFT_VERSION;

  // Canvas dimensions
  view.setUint32(offset, meta.canvasWidth, true);
  offset += 4;
  view.setUint32(offset, meta.canvasHeight, true);
  offset += 4;

  // Internal layer counter
  view.setUint32(offset, meta.layerCount, true);
  offset += 4;

  // Active layer ID
  view.setUint16(offset, activeLayerIdBytes.length, true);
  offset += 2;
  bytes.set(activeLayerIdBytes, offset);
  offset += activeLayerIdBytes.length;

  // Layer entries count
  view.setUint16(offset, meta.layers.length, true);
  offset += 2;

  // Layers
  for (let i = 0; i < meta.layers.length; i++) {
    const layer = meta.layers[i];
    const idBytes = layerStrings[i].id;
    const nameBytes = layerStrings[i].name;
    const png = pngBuffers[i];

    view.setUint16(offset, idBytes.length, true);
    offset += 2;
    bytes.set(idBytes, offset);
    offset += idBytes.length;

    view.setUint16(offset, nameBytes.length, true);
    offset += 2;
    bytes.set(nameBytes, offset);
    offset += nameBytes.length;

    bytes[offset++] = layer.visible ? 1 : 0;

    view.setUint32(offset, layer.width, true);
    offset += 4;
    view.setUint32(offset, layer.height, true);
    offset += 4;

    view.setUint32(offset, png.length, true);
    offset += 4;
    bytes.set(png, offset);
    offset += png.length;
  }

  return new Blob([buffer], {type: WDRAFT_MIME_TYPE});
}

export function parseWdraftBinary(buffer: ArrayBuffer): ParsedWdraftFile {
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);

  if (buffer.byteLength < 5) {
    throw new Error('Invalid .wdraft file: too short.');
  }

  // Magic
  for (let i = 0; i < WDRAFT_MAGIC.length; i++) {
    if (bytes[i] !== WDRAFT_MAGIC[i]) {
      throw new Error('Invalid .wdraft file: wrong magic bytes.');
    }
  }

  let offset = 4;

  // Version
  const version = bytes[offset++];
  if (version !== WDRAFT_VERSION) {
    throw new Error(`Unsupported .wdraft version: ${version}. Expected ${WDRAFT_VERSION}.`);
  }

  const canvasWidth = view.getUint32(offset, true);
  offset += 4;
  const canvasHeight = view.getUint32(offset, true);
  offset += 4;
  const layerCount = view.getUint32(offset, true);
  offset += 4;

  const activeLayerIdLen = view.getUint16(offset, true);
  offset += 2;
  const activeLayerId = dec.decode(bytes.subarray(offset, offset + activeLayerIdLen));
  offset += activeLayerIdLen;

  const layerEntries = view.getUint16(offset, true);
  offset += 2;

  if (layerEntries === 0) {
    throw new Error('Invalid .wdraft file: no layers.');
  }

  const layers: WdraftLayerMeta[] = [];
  const pngBuffers: Uint8Array[] = [];

  for (let i = 0; i < layerEntries; i++) {
    const idLen = view.getUint16(offset, true);
    offset += 2;
    const id = dec.decode(bytes.subarray(offset, offset + idLen));
    offset += idLen;

    const nameLen = view.getUint16(offset, true);
    offset += 2;
    const name = dec.decode(bytes.subarray(offset, offset + nameLen));
    offset += nameLen;

    const visible = bytes[offset++] !== 0;

    const width = view.getUint32(offset, true);
    offset += 4;
    const height = view.getUint32(offset, true);
    offset += 4;

    const pngLen = view.getUint32(offset, true);
    offset += 4;
    const png = bytes.slice(offset, offset + pngLen);
    offset += pngLen;

    layers.push({id, name, visible, width, height});
    pngBuffers.push(png);
  }

  return {
    meta: {version, canvasWidth, canvasHeight, activeLayerId, layerCount, layers},
    pngBuffers,
  };
}
