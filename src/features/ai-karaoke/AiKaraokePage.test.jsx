import '../../../test/setup.js';
import assert from 'node:assert/strict';
import test, { afterEach, beforeEach, mock } from 'node:test';
import React from 'react';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { AuthProvider } from '../../context/AuthContext.jsx';
import {
  getApiEndpoints,
  getApiInitError,
  overrideApiConfigForTests,
} from '../../config/apiEndpoints.js';
import AiKaraokePage from './AiKaraokePage.jsx';
import config from './config.js';

const sampleTask = {
  id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  base_track_file: 'original.mp3',
  result_track_id: 'result-track-id',
  vocal_file: 'vocals.mp3',
  instrumental_file: 'instrumental.mp3',
  lang_code: 'ru',
  transcript: [
    {
      text: 'Пример текста',
      start: 0,
      end: 10,
      words: [
        {
          text: 'Пример',
          start: 0,
          end: 2,
          confidence: 0.92,
          speaker: 'A',
        },
      ],
    },
  ],
  status: 'created',
};

let originalFetch;
const defaultToken = 'test-token';
const defaultCreateTaskUrl =
  'http://api.example.com/karaoke-tracks/create-task-from-file';

const renderWithAuth = (ui) => render(<AuthProvider>{ui}</AuthProvider>);
const initialEndpoints = { ...getApiEndpoints() };
const initialInitError = getApiInitError();
const renderPage = ({ createTaskFromFile, apiInitError } = {}) => {
  if (createTaskFromFile !== undefined || apiInitError !== undefined) {
    overrideApiConfigForTests({
      endpoints: {
        ...initialEndpoints,
        ...(createTaskFromFile !== undefined ? { createTaskFromFile } : {}),
      },
      initError: apiInitError ?? null,
    });
  }

  return renderWithAuth(<AiKaraokePage />);
};

beforeEach(() => {
  mock.restoreAll();
  originalFetch = globalThis.fetch;
  window.localStorage.setItem('token', defaultToken);
  overrideApiConfigForTests({
    endpoints: {
      ...initialEndpoints,
      createTaskFromFile: defaultCreateTaskUrl,
    },
    initError: null,
  });
});

afterEach(() => {
  cleanup();
  globalThis.fetch = originalFetch;
  window.localStorage.clear();
  overrideApiConfigForTests({
    endpoints: { ...initialEndpoints },
    initError: initialInitError,
  });
  mock.restoreAll();
});

test('shows validation errors when required inputs are missing', async () => {
  renderPage();

  fireEvent.click(
    screen.getByRole('button', { name: config.form.submitLabel }),
  );

  assert.ok(screen.getByText(config.validationMessages.fileRequired));
  assert.ok(screen.getByText(config.validationMessages.langRequired));
});

test('submits multipart request and renders returned task data', async () => {
  const fetchCalls = [];

  globalThis.fetch = async (input, init) => {
    fetchCalls.push({ input, init });

    const responsePayload = { data: sampleTask };

    return new Response(JSON.stringify(responsePayload), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  };

  renderPage();

  const file = new File(['demo'], 'song.mp3', { type: 'audio/mpeg' });

  fireEvent.change(screen.getByLabelText(config.form.fileLabel), {
    target: { files: [file] },
  });

  fireEvent.change(screen.getByLabelText(config.form.languageLabel), {
    target: { value: 'ru' },
  });

  fireEvent.click(
    screen.getByRole('button', { name: config.form.submitLabel }),
  );

  await waitFor(() => {
    assert.ok(screen.getByText(sampleTask.id));
  });

  assert.equal(fetchCalls.length, 1);
  assert.equal(String(fetchCalls[0].input), defaultCreateTaskUrl);
  assert.equal(fetchCalls[0].init.method, 'POST');
  assert.equal(
    fetchCalls[0].init.headers.Authorization,
    `Bearer ${defaultToken}`,
  );

  const bodyEntries = Array.from(fetchCalls[0].init.body.entries());
  const fileEntry = bodyEntries.find(([key]) => key === 'file');
  const langEntry = bodyEntries.find(([key]) => key === 'lang_code');

  assert.ok(fileEntry);
  assert.equal(fileEntry[1].name, 'song.mp3');
  assert.ok(langEntry);
  assert.equal(langEntry[1], 'ru');

  assert.ok(screen.getByText(sampleTask.status));
  assert.ok(screen.getByText(`Исходный файл: ${sampleTask.base_track_file}`));
  assert.ok(screen.getByText(sampleTask.transcript[0].text));
  assert.ok(screen.getByText(sampleTask.transcript[0].words[0].text));
});

test('omits Authorization header when token is missing', async () => {
  window.localStorage.removeItem('token');

  let capturedHeaders;

  globalThis.fetch = async (_, init) => {
    capturedHeaders = init.headers;

    return new Response(JSON.stringify({ data: sampleTask }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  };

  renderPage();

  const file = new File(['demo'], 'song.mp3', { type: 'audio/mpeg' });

  fireEvent.change(screen.getByLabelText(config.form.fileLabel), {
    target: { files: [file] },
  });

  fireEvent.change(screen.getByLabelText(config.form.languageLabel), {
    target: { value: 'ru' },
  });

  fireEvent.click(
    screen.getByRole('button', { name: config.form.submitLabel }),
  );

  await waitFor(() => {
    assert.ok(screen.getByText(sampleTask.id));
  });

  assert.equal(capturedHeaders, undefined);
});

test('renders API error payload when request fails', async () => {
  const errorPayload = {
    code: 'bad_request',
    message: 'Неверный запрос',
    details: 'Проверьте формат файла',
  };

  globalThis.fetch = async () =>
    new Response(JSON.stringify(errorPayload), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });

  renderPage();

  const file = new File(['demo'], 'song.mp3', { type: 'audio/mpeg' });

  fireEvent.change(screen.getByLabelText(config.form.fileLabel), {
    target: { files: [file] },
  });

  fireEvent.change(screen.getByLabelText(config.form.languageLabel), {
    target: { value: 'ru' },
  });

  fireEvent.click(
    screen.getByRole('button', { name: config.form.submitLabel }),
  );

  await waitFor(() => {
    assert.ok(screen.getByText(errorPayload.message));
  });

  assert.ok(screen.getByText(`Код: ${errorPayload.code}`));
  assert.ok(screen.getByText(errorPayload.details));
});

test('shows loading state while request is pending', async () => {
  let resolveRequest;

  globalThis.fetch = () =>
    new Promise((resolve) => {
      resolveRequest = resolve;
    });

  renderPage();

  const file = new File(['demo'], 'song.mp3', { type: 'audio/mpeg' });

  fireEvent.change(screen.getByLabelText(config.form.fileLabel), {
    target: { files: [file] },
  });

  fireEvent.change(screen.getByLabelText(config.form.languageLabel), {
    target: { value: 'ru' },
  });

  fireEvent.click(
    screen.getByRole('button', { name: config.form.submitLabel }),
  );

  await waitFor(() => {
    assert.ok(screen.getByRole('button', { name: config.form.loadingLabel }));
  });

  resolveRequest(
    new Response(JSON.stringify({ data: sampleTask }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }),
  );

  await waitFor(() => {
    assert.ok(screen.getByText(sampleTask.status));
  });
});

test('surfaces API configuration issues', async () => {
  const configError = new Error('missing env var');

  renderPage({ apiInitError: configError, createTaskFromFile: '' });

  await waitFor(() => {
    assert.ok(screen.getByText(/Конфигурация API недоступна/i));
  });
});

test('allows https endpoint when page uses http protocol', async () => {
  const httpsEndpoint =
    'https://api.example.com/karaoke-tracks/create-task-from-file';
  const fetchSpy = mock.fn(async () =>
    new Response(JSON.stringify({ data: sampleTask }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
  globalThis.fetch = fetchSpy;

  renderPage({
    createTaskFromFile: httpsEndpoint,
  });

  const file = new File(['demo'], 'song.mp3', { type: 'audio/mpeg' });

  fireEvent.change(screen.getByLabelText(config.form.fileLabel), {
    target: { files: [file] },
  });

  fireEvent.change(screen.getByLabelText(config.form.languageLabel), {
    target: { value: 'ru' },
  });

  fireEvent.click(
    screen.getByRole('button', { name: config.form.submitLabel }),
  );

  await waitFor(() => {
    assert.equal(fetchSpy.mock.calls.length, 1);
    assert.ok(screen.getByText(sampleTask.id));
  });

  assert.equal(String(fetchSpy.mock.calls[0].arguments[0]), httpsEndpoint);
});

test('shows configuration error when endpoint URL cannot be parsed', async () => {
  const fetchSpy = mock.fn();
  globalThis.fetch = fetchSpy;

  renderPage({ createTaskFromFile: 'http://' });

  const file = new File(['demo'], 'song.mp3', { type: 'audio/mpeg' });

  fireEvent.change(screen.getByLabelText(config.form.fileLabel), {
    target: { files: [file] },
  });

  fireEvent.change(screen.getByLabelText(config.form.languageLabel), {
    target: { value: 'ru' },
  });

  fireEvent.click(
    screen.getByRole('button', { name: config.form.submitLabel }),
  );

  await waitFor(() => {
    assert.ok(
      screen.getByText(/Endpoint для создания задачи настроен некорректно/i),
    );
  });

  assert.equal(fetchSpy.mock.calls.length, 0);
});
