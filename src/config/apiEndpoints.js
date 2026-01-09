const normalizeBaseUrl = (value) => {
  if (!value) {
    return '';
  }

  return String(value).replace(/\/+$/, '');
};

const runtimeEnv =
  import.meta.env ??
  globalThis?.import_meta_env ??
  (typeof process !== 'undefined' ? process.env : {}) ??
  {};

const assertCreateTaskFromFilePath = (value) => {
  const url = (() => {
    try {
      return new URL(value, 'https://placeholder.local');
    } catch (error) {
      return null;
    }
  })();

  const pathname = url?.pathname ?? '';
  const isKaraokeTaskPath = /\/karaoke-tracks\/create-task-from-file\/?$/i.test(
    pathname,
  );

  if (!isKaraokeTaskPath) {
    throw new Error(
      'VITE_CREATE_TASK_FILE должен указывать на путь ' +
        '`/api/karaoke-tracks/create-task-from-file` (полный URL или относительный). ' +
        'Неподдерживаемые значения вроде `/api/basic-tracks/create-task-from-file` приведут к CORS-ошибкам.',
    );
  }

  return value;
};

const ENV_VALIDATORS = {
  VITE_CREATE_TASK_FILE: assertCreateTaskFromFilePath,
};

const readEnv = (key) => {
  const value = runtimeEnv?.[key];

  if (value === undefined || value === null) {
    throw new Error(
      `Отсутствует переменная окружения ${key}. Проверьте настройки деплоя.`,
    );
  }

  const trimmed = String(value).trim();

  if (!trimmed) {
    throw new Error(
      `Переменная окружения ${key} пуста. Заполните значение в настройках деплоя.`,
    );
  }

  const validator = ENV_VALIDATORS[key];

  return validator ? validator(trimmed) : trimmed;
};

const REQUIRED_ENV_KEYS = [
  'VITE_AUTH_SIGN_IN_ENDPOINT',
  'VITE_READY_TRACKS_ENDPOINT',
  'VITE_JOB_STATUS_ENDPOINT',
  'VITE_CREATE_TASK_URL',
  'VITE_CREATE_TASK_FILE',
];

class EnvConfigError extends Error {
  constructor(missingKeys = [], details = []) {
    super(`Неверная конфигурация окружения: ${missingKeys.join(', ')}`);
    this.name = 'EnvConfigError';
    this.missingKeys = missingKeys;
    this.details = details;
  }
}

const validateRequiredEnv = () => {
  const values = {};
  const missingKeys = [];
  const details = [];

  REQUIRED_ENV_KEYS.forEach((key) => {
    try {
      values[key] = readEnv(key);
    } catch (error) {
      missingKeys.push(key);
      if (error?.message) {
        details.push(error.message);
      }
    }
  });

  return { values, missingKeys, details };
};

const API_BASE_URL = normalizeBaseUrl(runtimeEnv?.VITE_API_BASE_URL);

const getCurrentOrigin = () => {
  if (typeof window !== 'undefined' && window?.location?.origin) {
    return window.location.origin;
  }

  if (globalThis?.location?.origin) {
    return globalThis.location.origin;
  }

  if (runtimeEnv?.ORIGIN) {
    try {
      return new URL(String(runtimeEnv.ORIGIN)).origin;
    } catch (error) {
      // fall through and treat origin as unavailable
    }
  }

  return null;
};

const getOriginFromUrl = (value) => {
  try {
    return new URL(String(value)).origin;
  } catch (error) {
    return null;
  }
};

const withApiBase = (pathLike) => {
  const normalizedPath = String(pathLike || '').trim();

  if (!normalizedPath) {
    return '';
  }

  if (/^https?:\/\//i.test(normalizedPath)) {
    return normalizedPath;
  }

  const sanitizedPath = normalizedPath.startsWith('/')
    ? normalizedPath
    : `/${normalizedPath}`;

  if (!API_BASE_URL) {
    return sanitizedPath;
  }

  const baseOrigin = getOriginFromUrl(API_BASE_URL);
  const currentOrigin = getCurrentOrigin();

  if (baseOrigin && currentOrigin && baseOrigin === currentOrigin) {
    return sanitizedPath;
  }

  return `${API_BASE_URL}${sanitizedPath}`;
};

const buildApiEndpoints = (requiredValues) => ({
  authSignIn: withApiBase(requiredValues.VITE_AUTH_SIGN_IN_ENDPOINT),
  readyTracks: withApiBase(requiredValues.VITE_READY_TRACKS_ENDPOINT),
  jobStatus: withApiBase(requiredValues.VITE_JOB_STATUS_ENDPOINT),
  createTaskFromUrl: withApiBase(requiredValues.VITE_CREATE_TASK_URL),
  createTaskFromFile: withApiBase(requiredValues.VITE_CREATE_TASK_FILE),
});

const EMPTY_API_ENDPOINTS = {
  authSignIn: '',
  readyTracks: '',
  jobStatus: '',
  createTaskFromUrl: '',
  createTaskFromFile: '',
};

const envValidationResult = validateRequiredEnv();

let apiInitError = null;
let apiEndpoints = null;

if (envValidationResult.missingKeys.length > 0) {
  apiInitError = new EnvConfigError(
    envValidationResult.missingKeys,
    envValidationResult.details,
  );
  apiEndpoints = EMPTY_API_ENDPOINTS;
} else {
  apiEndpoints = buildApiEndpoints(envValidationResult.values);
}

const getApiEndpoints = () => apiEndpoints;
const getApiInitError = () => apiInitError;
const getEnvValidationResult = () => envValidationResult;
const overrideApiConfigForTests = ({ endpoints, initError } = {}) => {
  if (endpoints) {
    apiEndpoints = { ...apiEndpoints, ...endpoints };
  }

  if (initError !== undefined) {
    apiInitError = initError;
  }
};

export {
  EnvConfigError,
  API_BASE_URL,
  withApiBase,
  getApiEndpoints,
  getApiInitError,
  getEnvValidationResult,
  REQUIRED_ENV_KEYS,
  overrideApiConfigForTests,
};
export default apiEndpoints;
