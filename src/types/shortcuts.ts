export type ShortcutOptions = {
  openImagePicker: () => void;
  exportImage: () => Promise<void>;
  onSave: () => void;
  openShortcutsDialog: () => void;
};
