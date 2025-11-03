import { collectCandidateObjects } from '../../utils/payloadUtils.js';

const STATUS_KEYS = [
  'status',
  'stage',
  'state',
  'phase',
  'step',
  'currentStep',
  'current_stage',
  'jobStatus',
  'statusText',
];

export const STAGE_SEQUENCE = ['uploading', 'splitting', 'transcribing', 'complete'];

export const STATUS_ALIASES = {
  uploading: ['uploading', 'pending', 'queued', 'initializing', 'created', 'starting'],
  splitting: ['splitting', 'separating', 'processing', 'isolation', 'lalal'],
  transcribing: ['transcribing', 'transcribe', 'asr', 'speech_to_text', 'recognition'],
  complete: ['complete', 'completed', 'done', 'finished', 'success', 'ready'],
  error: ['error', 'failed', 'failure', 'cancelled', 'canceled', 'timeout'],
};

const normalizeValue = (value) => {
  if (value == null) {
    return '';
  }

  if (typeof value === 'string') {
    return value.trim().toLowerCase();
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value).trim().toLowerCase();
  }

  return '';
};

export const resolveStatusFromPayload = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return undefined;
  }

  for (const key of STATUS_KEYS) {
    if (key in payload && payload[key] != null) {
      return payload[key];
    }
  }

  if (payload.progress && typeof payload.progress === 'object') {
    for (const key of STATUS_KEYS) {
      if (key in payload.progress && payload.progress[key] != null) {
        return payload.progress[key];
      }
    }
  }

  if (payload.data && typeof payload.data === 'object') {
    for (const key of STATUS_KEYS) {
      if (key in payload.data && payload.data[key] != null) {
        return payload.data[key];
      }
    }
  }

  const candidates = collectCandidateObjects(payload);

  for (const candidate of candidates) {
    for (const key of STATUS_KEYS) {
      if (key in candidate && candidate[key] != null) {
        return candidate[key];
      }
    }
  }

  return undefined;
};

export const normalizeJobStage = (statusValue) => {
  const normalizedValue = normalizeValue(statusValue);
  const result = {
    stage: 'uploading',
    isFinal: false,
    isError: false,
    isUnknown: false,
    source: statusValue ?? null,
  };

  if (!normalizedValue) {
    result.isUnknown = true;
    return result;
  }

  if (STATUS_ALIASES.error.includes(normalizedValue)) {
    result.stage = 'complete';
    result.isFinal = true;
    result.isError = true;
    return result;
  }

  if (STATUS_ALIASES.complete.includes(normalizedValue)) {
    result.stage = 'complete';
    result.isFinal = true;
    return result;
  }

  for (const stage of STAGE_SEQUENCE) {
    if (stage === 'complete') {
      continue;
    }

    const aliases = STATUS_ALIASES[stage];
    if (aliases && aliases.includes(normalizedValue)) {
      result.stage = stage;
      return result;
    }
  }

  result.isUnknown = true;
  return result;
};

export const appendHistoryEntry = (history, entry) => {
  const safeHistory = Array.isArray(history) ? history : [];
  const { stage, rawStatus, timestamp = Date.now(), isError = false } = entry;

  if (!stage) {
    return safeHistory;
  }

  const lastEntry = safeHistory[safeHistory.length - 1];

  if (
    lastEntry &&
    lastEntry.stage === stage &&
    lastEntry.isError === isError &&
    (lastEntry.rawStatus ?? null) === (rawStatus ?? null)
  ) {
    const updated = safeHistory.slice(0, -1);
    updated.push({ ...lastEntry, timestamp });
    return updated;
  }

  return [
    ...safeHistory,
    {
      stage,
      rawStatus: rawStatus ?? null,
      timestamp,
      isError,
    },
  ];
};
