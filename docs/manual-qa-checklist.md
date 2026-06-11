# WebDraft Manual QA Checklist

Use this before replacing the old entrypoint or after larger editor changes.

## Automated Gate

- [ ] Run `npm run check` in `app-v3/`.
- [ ] Confirm the app opens at `http://127.0.0.1:5173/`.
- [ ] Confirm the browser console has no unexpected errors during basic use.

## Drawing Tools

- [ ] Pencil draws a continuous stroke and enables Undo.
- [ ] Eraser removes pixels from the active layer.
- [ ] Size slider changes brush width.
- [ ] Color picker changes stroke color.
- [ ] Sampler picks a visible non-transparent color and returns to Pencil.
- [ ] Fill bucket fills a contiguous active-layer region using Fill color, Fill opacity, and Bucket tolerance.
- [ ] Web tool draws the main stroke plus nearby connecting lines.

## Shapes And Text

- [ ] Rectangle preview appears while dragging and commits on pointer up.
- [ ] Ellipse preview appears while dragging and commits on pointer up.
- [ ] Fill toggle, fill color, and fill opacity affect shapes.
- [ ] Text tool opens a textarea over the selected bounds.
- [ ] Text commits on blur.
- [ ] Text font, alignment, bold, italic, and size are reflected on commit.

## Selection And Clipboard

- [ ] Select tool draws a clipped selection frame.
- [ ] Copy enables Paste.
- [ ] Cut removes the selected pixels and enables Paste.
- [ ] Paste places pixels at the selection bounds.
- [ ] Delete or Backspace clears the active layer.

## Layers

- [ ] Add layer creates a new active layer.
- [ ] Delete layer removes the active layer but never removes the last layer.
- [ ] Move up/down changes layer order and visual stacking.
- [ ] Hide/show toggles visibility and export respects hidden layers.
- [ ] Rename keeps a non-empty name and ignores empty names.
- [ ] Layer thumbnails update after drawing and transforms.

## History

- [ ] Undo/redo works for drawing strokes.
- [ ] Undo/redo works for shapes and text.
- [ ] Undo/redo works for add/delete/move/rename/hide/show layer.
- [ ] Undo/redo works after image import.
- [ ] Undo/redo works after canvas resize.
- [ ] New edits after Undo clear the Redo stack.
- [ ] History remains bounded to the latest 30 operations.

## Canvas And Files

- [ ] Resize canvas changes the visible canvas and keeps existing layer pixels at the top-left.
- [ ] Upload image creates a new fitted layer.
- [ ] Export PNG downloads a composited image.
- [ ] Exported PNG excludes hidden layers.
- [ ] Camera snap either adds a new layer or shows a permission/device error toast.

## Status And Errors

- [ ] Successful image import shows a success toast.
- [ ] Successful PNG export shows a success toast.
- [ ] Successful resize shows the new canvas size in a toast.
- [ ] Camera denial or unsupported camera shows an error toast.
- [ ] Toasts do not block drawing or toolbar interaction.

## Responsive Layout

- [ ] Desktop sidebar scrolls independently from the canvas workspace.
- [ ] Desktop page has no accidental horizontal body overflow.
- [ ] Mobile toolbar scrolls horizontally.
- [ ] Mobile workspace scrolls the canvas instead of widening the page.
- [ ] Text inside buttons and controls remains readable at mobile width.

## Keyboard Shortcuts

- [ ] `S`, `P`, `E`, `C`, `B`, `W`, `R`, `O`, `T` switch tools.
- [ ] `[` and `]` change brush size.
- [ ] Cmd/Ctrl+Z and Cmd/Ctrl+Shift+Z undo/redo.
- [ ] Cmd/Ctrl+Y redoes.
- [ ] Cmd/Ctrl+O opens image picker.
- [ ] Cmd/Ctrl+S exports PNG.
- [ ] Cmd/Ctrl+C/X/V copy, cut, paste a selection.
- [ ] `I`, `,`, `.`, `H`, `V` run invert, rotate, and mirror actions.
