# `.wdraft` File Format

## Overview

`.wdraft` is the native project format for WebDraft. It preserves all layers with their full pixel data, canvas dimensions, layer order, visibility, and the active layer — allowing work to be resumed exactly as it was left.

- **Extension:** `.wdraft`
- **MIME type:** `application/x-webdraft`
- **Encoding:** UTF-8 JSON

---

## Schema

```json
{
  "version": 1,
  "canvasWidth": 900,
  "canvasHeight": 620,
  "activeLayerId": "layer-3",
  "layerCount": 5,
  "layers": [
    {
      "id": "layer-1",
      "name": "Background",
      "visible": true,
      "width": 900,
      "height": 620,
      "imageDataUrl": "data:image/png;base64,..."
    }
  ]
}
```

### Top-level fields

| Field | Type | Description |
|---|---|---|
| `version` | `number` | Format version. Currently `1`. |
| `canvasWidth` | `number` | Canvas width in pixels. |
| `canvasHeight` | `number` | Canvas height in pixels. |
| `activeLayerId` | `string` | ID of the layer that was active at save time. |
| `layerCount` | `number` | Internal counter used to generate unique layer IDs after import. Must be ≥ the highest layer index. |
| `layers` | `WdraftLayer[]` | Ordered array of layers, bottom to top. |

### Layer fields (`WdraftLayer`)

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique layer identifier (e.g. `"layer-1"`). |
| `name` | `string` | Display name shown in the layers panel. |
| `visible` | `boolean` | Whether the layer is visible when compositing. |
| `width` | `number` | Width of the layer canvas in pixels. |
| `height` | `number` | Height of the layer canvas in pixels. |
| `imageDataUrl` | `string` | PNG encoded as a base64 data URL (`data:image/png;base64,...`). |

---

## File size

Each layer's pixel data is stored as a lossless PNG base64 data URL. Approximate sizes:

| Canvas size | Layers | Estimated file size |
|---|---|---|
| 900 × 620 | 1 | ~300 KB |
| 900 × 620 | 5 | ~1.5 MB |
| 1920 × 1080 | 5 | ~5–10 MB |

Mostly-transparent layers compress very well; fully painted layers are larger.

---

## Versioning and compatibility

- The `version` field is checked on import. Files with a version other than `1` are rejected with an error.
- Future versions will increment this number and may add new fields. Parsers should reject unknown versions rather than silently ignore unrecognised fields.

---

## Usage in WebDraft

**Save project** — serialises all layers to a `.wdraft` file and downloads it.

**Open project** — reads a `.wdraft` file, restores canvas size and all layers, and pushes a history entry so the action can be undone.
