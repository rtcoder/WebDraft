type HistoryEntry<TSnapshot> = {
  before: TSnapshot;
  after: TSnapshot;
};

export class HistoryManager<TSnapshot> {
  private readonly undoStack: HistoryEntry<TSnapshot>[] = [];
  private readonly redoStack: HistoryEntry<TSnapshot>[] = [];

  get canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  get canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  push(before: TSnapshot, after: TSnapshot): void {
    this.undoStack.push({before, after});
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
    return entry.after;
  }
}
