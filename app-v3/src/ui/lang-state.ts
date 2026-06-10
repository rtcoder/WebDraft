import { parseWdraftBinary } from '../core/project-file';
import type { WebDraftEditor } from '../core/webdraft-editor';

const RESTORE_KEY = 'webdraft-lang-restore';

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function saveStateForReload(editor: WebDraftEditor): Promise<void> {
  const blob = await editor.exportProject();
  const base64 = await blobToBase64(blob);
  sessionStorage.setItem(RESTORE_KEY, base64);
}

export async function restoreStateAfterReload(editor: WebDraftEditor): Promise<void> {
  const base64 = sessionStorage.getItem(RESTORE_KEY);
  if (!base64) return;
  sessionStorage.removeItem(RESTORE_KEY);

  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const parsed = parseWdraftBinary(bytes.buffer as ArrayBuffer);
  await editor.importProject(parsed);
}
