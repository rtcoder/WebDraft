# WebDraft

[![CI](https://github.com/rtcoder/WebDraft/actions/workflows/ci.yml/badge.svg)](https://github.com/rtcoder/WebDraft/actions/workflows/ci.yml)

A fast, lightweight browser-based image editor built with vanilla TypeScript and the Canvas 2D API — no frameworks, no bloat, just a crisp drawing experience that loads instantly.

---

## Why WebDraft?

- **No installation** — open in any modern browser and start drawing
- **Offline-ready** — works without an internet connection after the first load
- **Privacy-first** — your images never leave your machine
- **Snappy** — built directly on Canvas 2D with zero runtime dependencies

---

## Features

### Drawing tools

| Tool | Description |
|------|-------------|
| Brush | Freehand painting with configurable size and hardness |
| Eraser | Remove pixels with smooth edges |
| Bucket fill | Flood-fill with tolerance control |
| Line | Straight lines with adjustable thickness |
| Rectangle | Outlined or filled rectangles |
| Ellipse | Outlined or filled ellipses |
| Move | Reposition the active layer |
| Eyedropper | Sample any colour from the canvas |
| Text | Rich text with live HTML editing |

### Brush & style
- Stroke and fill colour with independent opacity
- Shadow: enable/disable, colour, blur, X/Y offset
- Configurable brush size
- Web sensitivity for pressure-like variation

### Rich text editing
- Live `contenteditable` editor overlaid on the canvas
- Floating toolbar: **bold**, *italic*, underline, font family, font size, colour, alignment
- Edits render to canvas with full word-wrap matching the layer bounds

### Layers
- Add, delete, rename, and reorder layers
- Per-layer visibility toggle and opacity control
- Independent image data per layer — non-destructive editing

### Image operations
- Resize canvas with custom width/height
- Invert colours
- Mirror horizontally or vertically
- Rotate 90° left or right

### Canvas & viewport
- Zoom: 10 % – 800 % in discrete steps
- Ctrl + scroll wheel to zoom in/out
- Ctrl + `=` / `+` — zoom in
- Ctrl + `-` — zoom out
- Ctrl + `0` — reset zoom to 100 %
- Zoom percentage indicator in the menu bar

### File & export
- Save/open projects in `.wdraft` format (JSON, preserves all layers and state)
- Import images onto a new layer (PNG, JPG, …)
- Export the flattened canvas as PNG

### Undo / redo
- Full history stack
- Ctrl + Z — undo
- Ctrl + Y — redo

### Localisation
- English and Polish UI
- Language auto-detected from `navigator.languages`
- Switcher in the menu bar

---

## Keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl + Z | Undo |
| Ctrl + Y | Redo |
| Ctrl + S | Save project |
| Ctrl + O | Open project |
| Ctrl + Shift + E | Export PNG |
| Ctrl + scroll | Zoom in / out |
| Ctrl + = / + | Zoom in |
| Ctrl + - | Zoom out |
| Ctrl + 0 | Reset zoom |

---

## Getting started

```bash
git clone https://github.com/rtcoder/WebDraft.git
cd WebDraft
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

### Build

```bash
npm run build
```

### Type-check + build (CI)

```bash
npm run check
```

---

## Tech stack

- **TypeScript** — strict, zero-`any` codebase
- **Vite** — instant HMR dev server and optimised production build
- **Canvas 2D API** — all rendering, no WebGL
- **Zero runtime dependencies**

---

## License

MIT
