import {
  collectCandidateObjects,
  extractArrayFromPayload,
  extractObjectsFromPayload,
  extractValueByKeys,
} from '../../utils/payloadUtils.js';

const ID_KEYS = [
  'uuid',
  'jobUuid',
  'jobUUID',
  'jobId',
  'id',
  'job_id',
  'job_uuid',
  'taskId',
  'task_id',
  'trackId',
  'track_id',
];

const MESSAGE_KEYS = [
  'message',
  'detail',
  'statusMessage',
  'status_message',
  'error',
  'errorMessage',
  'error_message',
  'description',
  'statusDescription',
  'status_description',
];

const URL_KEYS = [
  'sourceUrl',
  'source_url',
  'url',
  'inputUrl',
  'input_url',
  'mediaUrl',
  'media_url',
  'originalUrl',
  'original_url',
];

const FILENAME_KEYS = ['fileName', 'filename', 'originalFileName', 'original_filename', 'name'];

const UPDATED_AT_KEYS = [
  'updatedAt',
  'updated_at',
  'lastUpdatedAt',
  'last_updated_at',
  'modifiedAt',
  'modified_at',
  'timestamp',
];

const CREATED_AT_KEYS = ['createdAt', 'created_at'];

const HISTORY_KEYS = ['history', 'events', 'progressHistory', 'progress_history'];

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

const toDate = (value) => {
  if (value == null) {
    return null;
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return new Date(value.getTime());
  }

  if (typeof value === 'number') {
    const timestamp = value > 0 && value < 1e12 ? value * 1000 : value;
    const date = new Date(timestamp);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (isNonEmptyString(value)) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
};

const toTimestamp = (value, fallback) => {
  const date = toDate(value);
  if (!date) {
    return fallback ?? Date.now();
  }

  return date.getTime();
};

export const extractJobId = (payload) => {
  const value = extractValueByKeys(payload, ID_KEYS, {
    predicate: (candidate) => candidate != null && candidate !== '',
  });

  return value != null ? String(value) : '';
};

export const extractMessageFromPayload = (payload) => {
  const message = extractValueByKeys(payload, MESSAGE_KEYS, {
    predicate: (candidate) => isNonEmptyString(candidate),
    transform: (candidate) => candidate.trim(),
  });

  return typeof message === 'string' ? message : '';
};

export const extractSourceFromPayload = (payload) => {
  const url = extractValueByKeys(payload, URL_KEYS, {
    predicate: (candidate) => isNonEmptyString(candidate),
    transform: (candidate) => candidate.trim(),
  });

  if (isNonEmptyString(url)) {
    return url;
  }

  const fileLabel = extractValueByKeys(payload, FILENAME_KEYS, {
    predicate: (candidate) => isNonEmptyString(candidate),
    transform: (candidate) => candidate.trim(),
  });

  return typeof fileLabel === 'string' ? fileLabel : '';
};

export const extractUpdatedAt = (payload) => {
  const value = extractValueByKeys(payload, UPDATED_AT_KEYS, {
    predicate: (candidate) => candidate != null && candidate !== '',
  });

  return toDate(value) ?? null;
};

export const extractCreatedAt = (payload) => {
  const value = extractValueByKeys(payload, CREATED_AT_KEYS, {
    predicate: (candidate) => candidate != null && candidate !== '',
  });

  return toDate(value) ?? null;
};

export const extractHistory = (payload) => {
  const histories = extractArrayFromPayload(payload, HISTORY_KEYS);
  return histories.filter((item) => item && typeof item === 'object');
};

export const extractTaskEntities = (payload) => {
  const arrayEntities = extractArrayFromPayload(payload, [
    'tasks',
    'items',
    'tracks',
    'list',
    'data',
    'results',
    'entities',
  ]);

  const objectEntities = extractObjectsFromPayload(payload, ['task', 'job', 'track', 'item', 'entity']);

  const combined = [...arrayEntities, ...objectEntities];
  const unique = new WeakSet();
  const result = [];

  const pushUnique = (value) => {
    if (value && typeof value === 'object' && !unique.has(value)) {
      unique.add(value);
      result.push(value);
    }
  };

  combined.forEach(pushUnique);

  if (result.length === 0) {
    const candidates = collectCandidateObjects(payload);
    if (candidates.length > 0) {
      pushUnique(candidates[candidates.length - 1]);
    }
  }

  return result;
};

export const createHistoryFromEntries = (entries, fallbackEntry) => {
  if (!Array.isArray(entries) || entries.length === 0) {
    return fallbackEntry ? [fallbackEntry] : [];
  }

  const normalized = entries
    .map((entry) => {
      if (!entry || typeof entry !== 'object') {
        return null;
      }

      const stage = entry.stage ?? entry.status ?? entry.state ?? entry.phase ?? '';

      if (!stage) {
        return null;
      }

      const rawStatus = entry.rawStatus ?? entry.status ?? entry.state ?? entry.phase ?? null;
      const isError = Boolean(entry.isError ?? entry.error ?? entry.failed ?? false);
      const timestampValue =
        entry.timestamp ??
        entry.time ??
        entry.at ??
        entry.updatedAt ??
        entry.updated_at ??
        entry.createdAt ??
        entry.created_at ??
        null;

      return {
        stage,
        rawStatus,
        timestamp: toTimestamp(timestampValue, fallbackEntry?.timestamp),
        isError,
      };
    })
    .filter(Boolean);

  if (normalized.length === 0) {
    return fallbackEntry ? [fallbackEntry] : [];
  }

  return normalized;
};
