import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createHistoryFromEntries,
  extractJobId,
  extractMessageFromPayload,
  extractSourceFromPayload,
  extractTaskEntities,
} from './taskParsers.js';

test('extractJobId извлекает идентификатор из BaseDataResponse_TrackCreatingTaskResponse_', () => {
  const payload = {
    data: {
      message: 'ok',
      task: {
        task_id: 'external-id',
        id: 'task-321',
      },
    },
  };

  assert.equal(extractJobId(payload), 'task-321');
});

test('extractMessageFromPayload и extractSourceFromPayload работают с вложенными объектами', () => {
  const payload = {
    data: {
      task: {
        id: 'task-500',
        source_url: 'https://example.com/demo.mp3',
      },
      message: 'Создано успешно',
    },
  };

  assert.equal(extractMessageFromPayload(payload), 'Создано успешно');
  assert.equal(extractSourceFromPayload(payload), 'https://example.com/demo.mp3');
});

test('extractTaskEntities поддерживает списки задач', () => {
  const payload = {
    data: {
      tasks: [
        { id: 'task-1', status: 'pending' },
        { id: 'task-2', status: 'complete' },
      ],
    },
  };

  const entities = extractTaskEntities(payload);
  const ids = entities.map((entity) => extractJobId(entity)).filter(Boolean);

  assert.ok(ids.includes('task-1'));
  assert.ok(ids.includes('task-2'));
});

test('createHistoryFromEntries нормализует временные метки', () => {
  const entries = [
    { stage: 'uploading', timestamp: '2024-05-20T10:00:00Z' },
    { status: 'complete', updated_at: '2024-05-20T11:00:00Z', isError: false },
  ];

  const history = createHistoryFromEntries(entries, {
    stage: 'uploading',
    rawStatus: 'pending',
    timestamp: Date.now(),
    isError: false,
  });

  assert.equal(history.length, 2);
  assert.equal(history[0].stage, 'uploading');
  assert.equal(history[1].stage, 'complete');
});
