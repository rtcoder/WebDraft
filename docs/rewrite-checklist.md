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
- [x] Recreate the current tool inventory from the old app.
- [x] Rebuild layers UI without jQuery.
- [x] Add upload image support.
- [x] Add PNG export.
- [x] Add selection, copy, cut, paste.
- [x] Add shape tools.
- [x] Add fill options for shape tools.
- [x] Add text tool.
- [x] Add web drawing tool.
- [x] Add fill bucket tool.
- [x] Add active-layer invert, mirror, and rotate actions.
- [x] Add canvas resize, fill opacity, shadow controls, text options, and camera snap.
- [x] Add undo/redo history.
- [x] Add keyboard shortcuts.
- [x] Add responsive layout polish.
- [x] Add final smoke tests and regression tests.

## Old Code References

- `js/modules/WebDraft.js` - pointer flow and current editor state.
- `js/modules/Layers.js` - layer operations and previews.
- `js/modules/File.js` - upload and export behavior.
- `js/modules/Shapes.js` - rectangle and circle behavior.
- `js/modules/Text.js` - text selection and rendering behavior.
- `parts/*.part.html` - current UI inventory.

## Release Readiness

- Use `docs/manual-qa-checklist.md` before replacing the old entrypoint or after larger editor changes.
