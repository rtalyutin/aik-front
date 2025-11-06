import '../test/setup.js';
import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import App from './App.jsx';

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

const createJsonResponse = (data, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => data,
});

const assertFormDataContainsFile = (formData, expectedFileName) => {
  assert.ok(formData instanceof FormData, 'ожидался объект FormData в теле запроса');

  const uploadedFile = formData.get('file');

  assert.ok(uploadedFile, 'FormData не содержит поле file');

  if (typeof File !== 'undefined') {
    assert.ok(uploadedFile instanceof File, 'значение поля file должно быть экземпляром File');
  }

  assert.equal(uploadedFile?.name, expectedFileName);
};

test('создание задачи по новой схеме API', async () => {
  const originalFetch = global.fetch;
  const calls = [];

  global.fetch = async (input, init = {}) => {
    const url = typeof input === 'string' ? input : input.url;
    calls.push({ url, init });

    if (url.endsWith('/api/karaoke-tracks/tasks')) {
      return createJsonResponse({ data: { tasks: [] } });
    }

    if (url.endsWith('/api/karaoke-tracks')) {
      return createJsonResponse({ data: [] });
    }

    if (url.endsWith('/api/karaoke-tracks/create-task-from-url')) {
      assert.equal(init?.method, 'POST');
      const body = JSON.parse(init?.body ?? '{}');
      assert.deepEqual(body, { url: 'https://example.com/audio.mp3' });

      return createJsonResponse({
        data: {
          task: {
            id: 'task-123',
            status: 'pending',
            sourceUrl: 'https://example.com/audio.mp3',
            updatedAt: '2024-05-20T12:00:00Z',
          },
          message: 'Задача принята',
        },
      });
    }

    if (url.endsWith('/api/karaoke-tracks/tasks/task-123')) {
      return createJsonResponse({
        data: {
          task: {
            id: 'task-123',
            status: 'complete',
            updated_at: '2024-05-20T12:05:00Z',
          },
          message: 'Готово',
        },
      });
    }

    throw new Error(`Unhandled fetch URL: ${url}`);
  };

  try {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );

    await flushPromises();

    const addButton = await screen.findByRole('button', { name: /Добавить трек/i });
    fireEvent.click(addButton);

    const input = await screen.findByLabelText('Ссылка на аудио или видео');
    fireEvent.change(input, { target: { value: 'https://example.com/audio.mp3' } });

    const submitButton = screen.getByRole('button', { name: 'Создать задачу' });
    fireEvent.click(submitButton);

    await flushPromises();
    await screen.findByText(/ID: task-123/);

    const notice = screen.getByText(/task-123/);
    assert.ok(/task-123/.test(notice.textContent ?? ''));

    const hasStatusCall = calls.some(
      (call) => typeof call.url === 'string' && call.url.endsWith('/api/karaoke-tracks/tasks/task-123'),
    );
    assert.ok(hasStatusCall, 'ожидался запрос статуса задачи');
  } finally {
    global.fetch = originalFetch;
  }
});

test('обновление статуса обрабатывает вложенный ответ API', async () => {
  const originalFetch = global.fetch;

  const initialTrack = {
    id: 'task-777',
    sourceUrl: 'https://example.com/source.mp3',
    status: {
      stage: 'uploading',
      isFinal: false,
      isError: false,
      rawStatus: 'pending',
    },
    history: [],
    lastUpdatedAt: new Date(),
    isPolling: false,
    pollingError: '',
    isManualRefresh: false,
  };

  global.fetch = async (input, init = {}) => {
    const url = typeof input === 'string' ? input : input.url;

    if (url.endsWith('/api/karaoke-tracks/tasks')) {
      return createJsonResponse({ data: { tasks: [] } });
    }

    if (url.endsWith('/api/karaoke-tracks')) {
      return createJsonResponse({ data: [] });
    }

    if (url.endsWith('/api/karaoke-tracks/tasks/task-777')) {
      assert.equal(init?.method ?? 'GET', 'GET');
      return createJsonResponse({
        data: {
          task: {
            id: 'task-777',
            status: 'complete',
            updatedAt: '2024-05-21T10:00:00Z',
          },
          message: 'Обработка завершена',
        },
      });
    }

    throw new Error(`Unhandled fetch URL: ${url}`);
  };

  try {
    render(
      <MemoryRouter>
        <App initialTracks={[initialTrack]} />
      </MemoryRouter>,
    );

    await flushPromises();

    const refreshButton = await screen.findByRole('button', { name: /Обновить/i });
    fireEvent.click(refreshButton);

    await flushPromises();

    await screen.findByText('Обработка завершена');
    await screen.findByText(/API: complete/i);
  } finally {
    global.fetch = originalFetch;
  }
});

test('создание задачи из файла запускает поллинг статуса', async () => {
  const originalFetch = global.fetch;
  const calls = [];
  const demoFile = new File(['demo-content'], 'demo-track.mp3', { type: 'audio/mpeg' });

  global.fetch = async (input, init = {}) => {
    const url = typeof input === 'string' ? input : input.url;
    calls.push({ url, init });

    if (url.endsWith('/api/karaoke-tracks/tasks')) {
      return createJsonResponse({ data: { tasks: [] } });
    }

    if (url.endsWith('/api/karaoke-tracks')) {
      return createJsonResponse({ data: [] });
    }

    if (url.endsWith('/api/karaoke-tracks/create-task-from-file')) {
      assert.equal(init?.method, 'POST');
      assertFormDataContainsFile(init?.body, demoFile.name);

      return createJsonResponse(
        {
          data: {
            task: {
              id: 'file-task-1',
              status: 'pending',
              updated_at: '2024-05-25T10:00:00Z',
            },
            message: 'Файл принят',
          },
        },
        201,
      );
    }

    if (url.endsWith('/api/karaoke-tracks/tasks/file-task-1')) {
      return createJsonResponse({
        data: {
          task: {
            id: 'file-task-1',
            status: 'complete',
            name: 'demo-track.mp3',
            updated_at: '2024-05-25T10:02:00Z',
          },
          message: 'Файл готов',
        },
      });
    }

    throw new Error(`Unhandled fetch URL: ${url}`);
  };

  try {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );

    await flushPromises();

    const addButton = await screen.findByRole('button', { name: /Добавить трек/i });
    fireEvent.click(addButton);

    await screen.findByRole('dialog');

    const fileModeButton = await screen.findByRole('button', { name: 'Из файла' });
    fireEvent.click(fileModeButton);

    const fileInput = await screen.findByLabelText('Выберите аудио или видео файл');
    fireEvent.change(fileInput, { target: { files: [demoFile] } });

    const submitButton = screen.getByRole('button', { name: 'Создать задачу' });
    fireEvent.click(submitButton);

    await flushPromises();

    await screen.findByText(/ID: file-task-1/);
    await screen.findByText('Файл готов');
    await screen.findByText(/API: complete/i);

    const statusNotice = await screen.findByRole('status');
    assert.match(statusNotice.textContent ?? '', /file-task-1/);

    const trackButton = await screen.findByRole('button', { name: /Выбрать трек file-task-1/i });
    assert.equal(trackButton.getAttribute('aria-pressed'), 'true');

    const hasPollingCall = calls.some(
      (call) => typeof call.url === 'string' && call.url.endsWith('/api/karaoke-tracks/tasks/file-task-1'),
    );
    assert.ok(hasPollingCall, 'ожидался запрос статуса задачи после загрузки файла');
  } finally {
    global.fetch = originalFetch;
  }
});

test('ошибка HTTP при загрузке файла показывает сообщение об ошибке', async () => {
  const originalFetch = global.fetch;
  const calls = [];
  const demoFile = new File(['broken-content'], 'broken-track.mp3', { type: 'audio/mpeg' });

  global.fetch = async (input, init = {}) => {
    const url = typeof input === 'string' ? input : input.url;
    calls.push({ url, init });

    if (url.endsWith('/api/karaoke-tracks/tasks')) {
      return createJsonResponse({ data: { tasks: [] } });
    }

    if (url.endsWith('/api/karaoke-tracks')) {
      return createJsonResponse({ data: [] });
    }

    if (url.endsWith('/api/karaoke-tracks/create-task-from-file')) {
      assert.equal(init?.method, 'POST');
      assertFormDataContainsFile(init?.body, demoFile.name);

      return createJsonResponse({ message: 'Ошибка сервера' }, 500);
    }

    throw new Error(`Unhandled fetch URL: ${url}`);
  };

  try {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );

    await flushPromises();

    const addButton = await screen.findByRole('button', { name: /Добавить трек/i });
    fireEvent.click(addButton);

    await screen.findByRole('dialog');

    const fileModeButton = await screen.findByRole('button', { name: 'Из файла' });
    fireEvent.click(fileModeButton);

    const fileInput = await screen.findByLabelText('Выберите аудио или видео файл');
    fireEvent.change(fileInput, { target: { files: [demoFile] } });

    const submitButton = screen.getByRole('button', { name: 'Создать задачу' });
    fireEvent.click(submitButton);

    await flushPromises();

    const alert = await screen.findByRole('alert');
    assert.match(alert.textContent ?? '', /Не удалось создать задачу из файла \(HTTP 500\)/);

    const hasPollingCall = calls.some((call) => String(call.url).includes('/api/karaoke-tracks/tasks/'));
    assert.equal(hasPollingCall, false, 'поллинг не должен запускаться при ошибке создания');

    const playlistItems = screen.queryAllByText(/ID:/i);
    assert.equal(playlistItems.length, 0);
  } finally {
    global.fetch = originalFetch;
  }
});
