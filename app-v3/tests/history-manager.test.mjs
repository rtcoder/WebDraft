import assert from 'node:assert/strict';
import {importTypescriptModule, test} from './test-support.mjs';

const historyModule = await importTypescriptModule('../src/core/history-manager.ts');
const {HistoryManager} = historyModule;

test('HistoryManager returns previous and next snapshots', () => {
  const history = new HistoryManager();

  history.push('a', 'b');

  assert.equal(history.canUndo, true);
  assert.equal(history.canRedo, false);
  assert.equal(history.undo(), 'a');
  assert.equal(history.canUndo, false);
  assert.equal(history.canRedo, true);
  assert.equal(history.redo(), 'b');
  assert.equal(history.canUndo, true);
  assert.equal(history.canRedo, false);
});

test('HistoryManager clears redo stack after a new branch', () => {
  const history = new HistoryManager();

  history.push('a', 'b');
  assert.equal(history.undo(), 'a');
  history.push('a', 'c');

  assert.equal(history.canRedo, false);
  assert.equal(history.redo(), null);
  assert.equal(history.undo(), 'a');
});

console.log('History manager tests passed.');
