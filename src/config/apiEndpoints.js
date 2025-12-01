const normalizeBaseUrl = (value) => {
  if (!value) {
    return '';
  }

  return String(value).replace(/\/+$/, '');
};

const readEnv = (key) => {
  const value = import.meta.env?.[key];

  if (value === undefined || value === null) {
    throw new Error(`Отсутствует переменная окружения ${key}. Проверьте настройки деплоя.`);
  }

  const trimmed = String(value).trim();

  if (!trimmed) {
    throw new Error(`Переменная окружения ${key} пуста. Заполните значение в настройках деплоя.`);
  }

  return trimmed;
};

const API_BASE_URL = normalizeBaseUrl(import.meta.env?.VITE_API_BASE_URL);

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

  return `${API_BASE_URL}${sanitizedPath}`;
};

const apiEndpoints = {
  authSignIn: withApiBase(readEnv('VITE_AUTH_SIGN_IN_ENDPOINT')),
  readyTracks: withApiBase(readEnv('VITE_READY_TRACKS_ENDPOINT')),
  jobStatus: withApiBase(readEnv('VITE_JOB_STATUS_ENDPOINT')),
  createTaskFromUrl: withApiBase(readEnv('VITE_CREATE_TASK_URL')),
  createTaskFromFile: withApiBase(readEnv('VITE_CREATE_TASK_FILE')),
};

export { API_BASE_URL, withApiBase };
export default apiEndpoints;
