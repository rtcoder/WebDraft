# `.wdraft` File Format (v2)

## Overview

`.wdraft` is the native project format for WebDraft. It preserves all layers with their full pixel data, canvas dimensions, layer order, visibility, and the active layer — allowing work to be resumed exactly as it was left.

- **Extension:** `.wdraft`
- **MIME type:** `application/x-webdraft`
- **Encoding:** binary (little-endian)

---

## Binary layout

All multi-byte integers are **unsigned, little-endian**.

### Header

| Offset | Size | Type   | Field                     |
|--------|------|--------|---------------------------|
| 0      | 4    | bytes  | Magic: `0x57 0x44 0x46 0x54` (`"WDFT"`) |
| 4      | 1    | uint8  | Version (currently `2`)   |
| 5      | 4    | uint32 | Canvas width (px)         |
| 9      | 4    | uint32 | Canvas height (px)        |
| 13     | 4    | uint32 | Layer count (internal counter) |
| 17     | 2    | uint16 | Active layer ID length (bytes) |
| 19     | N    | UTF-8  | Active layer ID           |
| 19+N   | 2    | uint16 | Number of layer entries   |

### Per-layer block (repeated)

| Size | Type   | Field                         |
|------|--------|-------------------------------|
| 2    | uint16 | ID length (bytes)             |
| N    | UTF-8  | Layer ID                      |
| 2    | uint16 | Name length (bytes)           |
| N    | UTF-8  | Layer name                    |
| 1    | uint8  | Visible (`0` = hidden, `1` = visible) |
| 4    | uint32 | Layer canvas width (px)       |
| 4    | uint32 | Layer canvas height (px)      |
| 4    | uint32 | PNG data length (bytes)       |
| N    | bytes  | PNG data (raw, no base64)     |

Layers are stored bottom-to-top (index 0 = bottommost layer).

---

## Fields

- **Layer count** — internal counter used to generate unique layer IDs after import; must be ≥ the highest layer index.
- **Layer canvas width/height** — actual dimensions of the layer's canvas (may differ from canvas width/height if the canvas was resized after the layer was created).
- **PNG data** — lossless PNG encoded directly as raw bytes. No base64 encoding.

---

## File size

Without base64 overhead, files are ~25–33% smaller than a JSON equivalent.

| Canvas size | Layers | Estimated file size |
|-------------|--------|---------------------|
| 900 × 620   | 1      | ~200 KB             |
| 900 × 620   | 5      | ~1 MB               |
| 1920 × 1080 | 5      | ~4–7 MB             |

Mostly-transparent layers compress very well; fully painted layers are larger.

---

## Versioning

- The version byte is checked on import. Files with a version other than `2` are rejected.
- The magic bytes `WDFT` identify the file format independently of version.
- Version 1 was a JSON/base64 format — those files are not supported by this parser.

---

## Usage in WebDraft

**Save project** — serialises all layers to a `.wdraft` binary file and downloads it.

**Open project** — reads a `.wdraft` file with `FileReader.readAsArrayBuffer`, parses the binary, restores canvas size and all layers, and pushes a history entry so the action can be undone.
