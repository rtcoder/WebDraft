export const isMac =
  navigator.platform.startsWith('Mac') || navigator.userAgent.includes('Macintosh');

export const modKey = isMac ? '⌘' : 'Ctrl';
