import { strict as assert } from 'node:assert';
import { randomUUID } from 'node:crypto';
import { test } from 'node:test';

const loadApiEndpoints = async (env) => {
  globalThis.import_meta_env = env;
  return import(`./apiEndpoints.js?${randomUUID()}`);
};

test('reports missing variables through EnvConfigError with list of keys', async () => {
  const { getApiInitError, EnvConfigError, REQUIRED_ENV_KEYS } = await loadApiEndpoints({});
  const initError = getApiInitError();

  assert.ok(initError instanceof EnvConfigError);
  assert.deepEqual(initError.missingKeys.sort(), [...REQUIRED_ENV_KEYS].sort());
});

test('builds endpoints when all required variables are provided', async () => {
  const baseUrl = 'https://api.example.com/';
  const env = {
    VITE_API_BASE_URL: baseUrl,
    VITE_AUTH_SIGN_IN_ENDPOINT: '/auth/sign-in',
    VITE_READY_TRACKS_ENDPOINT: '/tracks',
    VITE_JOB_STATUS_ENDPOINT: '/jobs/status',
    VITE_CREATE_TASK_URL: '/tasks/from-url',
    VITE_CREATE_TASK_FILE: '/tasks/from-file',
  };

  const { getApiInitError, default: endpoints, getApiEndpoints } = await loadApiEndpoints(env);

  assert.equal(getApiInitError(), null);
  assert.equal(endpoints.authSignIn, 'https://api.example.com/auth/sign-in');
  assert.equal(getApiEndpoints().readyTracks, 'https://api.example.com/tracks');
});

test('keeps relative endpoints when API base matches current origin', async () => {
  const appOrigin = 'https://app.example.com';
  const env = {
    VITE_API_BASE_URL: appOrigin,
    VITE_AUTH_SIGN_IN_ENDPOINT: '/auth/sign-in',
    VITE_READY_TRACKS_ENDPOINT: '/tracks',
    VITE_JOB_STATUS_ENDPOINT: '/jobs/status',
    VITE_CREATE_TASK_URL: '/tasks/from-url',
    VITE_CREATE_TASK_FILE: '/tasks/from-file',
  };

  const originalWindow = globalThis.window;
  globalThis.window = { ...originalWindow, location: { origin: appOrigin } };

  try {
    const { default: endpoints, withApiBase } = await loadApiEndpoints(env);

    assert.equal(endpoints.createTaskFromFile, '/tasks/from-file');
    assert.equal(withApiBase('/api/status'), '/api/status');
  } finally {
    globalThis.window = originalWindow;
  }
});
