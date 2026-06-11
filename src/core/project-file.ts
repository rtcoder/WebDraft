import type {ParsedWdraftFile, TextLayerData, WdraftFileMeta, WdraftLayerMeta} from '../types';

export type {WdraftLayerMeta, WdraftFileMeta, ParsedWdraftFile};

export const WDRAFT_VERSION = 3;
export const WDRAFT_MAGIC = [0x57, 0x44, 0x46, 0x54] as const; // "WDFT"
export const WDRAFT_MIME_TYPE = 'application/x-webdraft';
export const WDRAFT_EXTENSION = '.wdraft';

const enc = new TextEncoder();
const dec = new TextDecoder();

export function serializeWdraftBinary(meta: WdraftFileMeta, pngBuffers: Uint8Array[]): Blob {
  const activeLayerIdBytes = enc.encode(meta.activeLayerId);
  const layerStrings = meta.layers.map((l) => ({
    id: enc.encode(l.id),
    name: enc.encode(l.name),
    textDataJson: l.textData ? enc.encode(JSON.stringify(l.textData)) : null,
  }));

  let size =
    4 + // magic
    1 + // version
    4 + // canvasWidth
    4 + // canvasHeight
    4 + // layerCount
    2 + activeLayerIdBytes.length + // activeLayerId
    2; // layer entries count

  for (let i = 0; i < meta.layers.length; i++) {
    const td = layerStrings[i].textDataJson;
    size +=
      2 + layerStrings[i].id.length +
      2 + layerStrings[i].name.length +
      1 + // visible
      4 + // width
      4 + // height
      4 + pngBuffers[i].length + // png data length + data
      2 + (td ? td.length : 0); // textData length + data (0 = none)
  }

  const buffer = new ArrayBuffer(size);
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);

  let offset = 0;

  for (const byte of WDRAFT_MAGIC) bytes[offset++] = byte;
  bytes[offset++] = WDRAFT_VERSION;

  view.setUint32(offset, meta.canvasWidth, true);
  offset += 4;
  view.setUint32(offset, meta.canvasHeight, true);
  offset += 4;
  view.setUint32(offset, meta.layerCount, true);
  offset += 4;

  view.setUint16(offset, activeLayerIdBytes.length, true);
  offset += 2;
  bytes.set(activeLayerIdBytes, offset);
  offset += activeLayerIdBytes.length;

  view.setUint16(offset, meta.layers.length, true);
  offset += 2;

  for (let i = 0; i < meta.layers.length; i++) {
    const layer = meta.layers[i];
    const idBytes = layerStrings[i].id;
    const nameBytes = layerStrings[i].name;
    const td = layerStrings[i].textDataJson;
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

    // v3: textData (2-byte length, 0 = no text data)
    const tdLen = td ? td.length : 0;
    view.setUint16(offset, tdLen, true);
    offset += 2;
    if (td && tdLen > 0) {
      bytes.set(td, offset);
      offset += tdLen;
    }
  }

  return new Blob([buffer], {type: WDRAFT_MIME_TYPE});
}

function migrateTextData(raw: unknown): TextLayerData | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const obj = raw as Record<string, unknown>;

  if (typeof obj.html === 'string' && obj.bounds) {
    return {
      html: obj.html,
      bounds: obj.bounds as TextLayerData['bounds'],
      defaultFontSize: typeof obj.defaultFontSize === 'number' ? obj.defaultFontSize : 16,
      defaultFontFamily: typeof obj.defaultFontFamily === 'string' ? obj.defaultFontFamily : 'sans-serif',
      defaultColor: typeof obj.defaultColor === 'string' ? obj.defaultColor : '#000000',
      defaultAlign: (typeof obj.defaultAlign === 'string' ? obj.defaultAlign : 'left') as CanvasTextAlign,
    };
  }

  // Old format: { text: string, bounds }
  if (typeof obj.text === 'string' && obj.bounds) {
    const html = obj.text
      .split('\n')
      .map((l) => l.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'))
      .join('<br>');
    return {
      html,
      bounds: obj.bounds as TextLayerData['bounds'],
      defaultFontSize: 16,
      defaultFontFamily: 'sans-serif',
      defaultColor: '#000000',
      defaultAlign: 'left',
    };
  }

  return undefined;
}

export function parseWdraftBinary(buffer: ArrayBuffer): ParsedWdraftFile {
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);

  if (buffer.byteLength < 5) {
    throw new Error('Invalid .wdraft file: too short.');
  }

  for (let i = 0; i < WDRAFT_MAGIC.length; i++) {
    if (bytes[i] !== WDRAFT_MAGIC[i]) {
      throw new Error('Invalid .wdraft file: wrong magic bytes.');
    }
  }

  let offset = 4;

  const version = bytes[offset++];
  if (version !== 2 && version !== WDRAFT_VERSION) {
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

    let textData: TextLayerData | undefined;
    if (version >= 3) {
      const tdLen = view.getUint16(offset, true);
      offset += 2;
      if (tdLen > 0) {
        try {
          textData = migrateTextData(JSON.parse(dec.decode(bytes.subarray(offset, offset + tdLen))));
        } catch {
          // malformed textData — ignore
        }
        offset += tdLen;
      }
    }

    layers.push({id, name, visible, width, height, textData});
    pngBuffers.push(png);
  }

  return {
    meta: {version, canvasWidth, canvasHeight, activeLayerId, layerCount, layers},
    pngBuffers,
  };
}
