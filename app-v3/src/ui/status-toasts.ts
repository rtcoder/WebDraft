export type StatusTone = 'info' | 'success' | 'error';

export type StatusReporter = {
  show: (message: string, tone?: StatusTone) => void;
};

export function createStatusToasts(): HTMLElement & StatusReporter {
  const host = Object.assign(document.createElement('div'), {
    show: (_message: string, _tone: StatusTone = 'info') => {},
  });
  host.className = 'status-toasts';
  host.setAttribute('aria-live', 'polite');
  host.show = (message, tone = 'info') => {
    const toast = document.createElement('div');
    toast.className = `status-toast status-toast--${tone}`;
    toast.textContent = message;

    host.replaceChildren(toast);
    window.setTimeout(() => {
      if (toast.parentElement === host) {
        toast.remove();
      }
    }, tone === 'error' ? 6000 : 3200);
  };

  return host;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Something went wrong.';
}
