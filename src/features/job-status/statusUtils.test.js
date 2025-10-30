import assert from 'node:assert/strict';
import test from 'node:test';
import { appendHistoryEntry, normalizeJobStage, resolveStatusFromPayload } from './statusUtils.js';

test('normalizeJobStage maps uploading aliases', () => {
  const result = normalizeJobStage('queued');
  assert.equal(result.stage, 'uploading');
  assert.equal(result.isFinal, false);
  assert.equal(result.isError, false);
  assert.equal(result.isUnknown, false);
});

test('normalizeJobStage maps generic processing to splitting stage', () => {
  const result = normalizeJobStage('processing');
  assert.equal(result.stage, 'splitting');
  assert.equal(result.isFinal, false);
});

test('normalizeJobStage maps completed status to final stage', () => {
  const result = normalizeJobStage('completed');
  assert.equal(result.stage, 'complete');
  assert.equal(result.isFinal, true);
  assert.equal(result.isError, false);
});

test('normalizeJobStage detects error statuses', () => {
  const result = normalizeJobStage('FAILED');
  assert.equal(result.stage, 'complete');
  assert.equal(result.isFinal, true);
  assert.equal(result.isError, true);
});

test('normalizeJobStage marks unknown statuses', () => {
  const result = normalizeJobStage('mystery');
  assert.equal(result.stage, 'uploading');
  assert.equal(result.isUnknown, true);
});

test('resolveStatusFromPayload reads direct status field', () => {
  const status = resolveStatusFromPayload({ status: 'completed' });
  assert.equal(status, 'completed');
});

test('resolveStatusFromPayload reads nested progress status field', () => {
  const status = resolveStatusFromPayload({ progress: { stage: 'asr' } });
  assert.equal(status, 'asr');
});

test('resolveStatusFromPayload reads nested data state field', () => {
  const status = resolveStatusFromPayload({ data: { state: 'queued' } });
  assert.equal(status, 'queued');
});

test('resolveStatusFromPayload returns undefined when not found', () => {
  const status = resolveStatusFromPayload({ foo: 'bar' });
  assert.equal(status, undefined);
});

test('appendHistoryEntry appends new entries', () => {
  const history = appendHistoryEntry([], { stage: 'uploading', rawStatus: 'queued', timestamp: 1 });
  assert.equal(history.length, 1);
  assert.equal(history[0].stage, 'uploading');
  assert.equal(history[0].rawStatus, 'queued');
});

test('appendHistoryEntry collapses duplicate stages', () => {
  const initial = [
    { stage: 'uploading', rawStatus: 'queued', timestamp: 1, isError: false },
  ];
  const history = appendHistoryEntry(initial, {
    stage: 'uploading',
    rawStatus: 'queued',
    timestamp: 2,
    isError: false,
  });
  assert.equal(history.length, 1);
  assert.equal(history[0].timestamp, 2);
});
