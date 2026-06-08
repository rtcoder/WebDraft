# WebDraft Rewrite Checklist

## Direction

- Build the new editor in `app-v3/`.
- Keep the old app intact as a reference until the rewrite is useful enough to replace it.
- Use Vanilla TypeScript modules and browser APIs first.
- Avoid jQuery, React, Angular, and server-side rendering.
- Consider Web Components only for repeated UI pieces once their shape stabilizes.

## Milestones

- [x] Create an isolated rewrite directory.
- [x] Add a lightweight Vite + TypeScript skeleton.
- [x] Add the first canvas surface, layer manager, pencil, eraser, size control, clear command, and custom color input wrapper.
- [ ] Recreate the current tool inventory from the old app.
- [x] Rebuild layers UI without jQuery.
- [x] Add upload image support.
- [x] Add PNG export.
- [ ] Add selection, copy, cut, paste.
- [x] Add shape tools.
- [ ] Add text tool.
- [ ] Add undo/redo history.
- [x] Add keyboard shortcuts.
- [ ] Add responsive layout polish.
- [ ] Add final smoke tests and regression tests.

## Old Code References

- `js/modules/WebDraft.js` - pointer flow and current editor state.
- `js/modules/Layers.js` - layer operations and previews.
- `js/modules/File.js` - upload and export behavior.
- `js/modules/Shapes.js` - rectangle and circle behavior.
- `js/modules/Text.js` - text selection and rendering behavior.
- `parts/*.part.html` - current UI inventory.
