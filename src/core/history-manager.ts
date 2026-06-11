type HistoryEntry<TSnapshot> = {
  before: TSnapshot;
  after: TSnapshot;
};

export class HistoryManager<TSnapshot> {
  private readonly undoStack: HistoryEntry<TSnapshot>[] = [];
  private readonly redoStack: HistoryEntry<TSnapshot>[] = [];

  constructor(private readonly limit = 30) {}

  get canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  get canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  push(before: TSnapshot, after: TSnapshot): void {
    this.undoStack.push({before, after});
    this.trimUndoStack();
    this.redoStack.length = 0;
  }

  undo(): TSnapshot | null {
    const entry = this.undoStack.pop();

    if (!entry) {
      return null;
    }

    this.redoStack.push(entry);
    return entry.before;
  }

  redo(): TSnapshot | null {
    const entry = this.redoStack.pop();

    if (!entry) {
      return null;
    }

    this.undoStack.push(entry);
    this.trimUndoStack();
    return entry.after;
  }

  private trimUndoStack(): void {
    if (this.limit < 1) {
      this.undoStack.length = 0;
      return;
    }

    const excessEntries = this.undoStack.length - this.limit;

    if (excessEntries > 0) {
      this.undoStack.splice(0, excessEntries);
    }
  }
}
