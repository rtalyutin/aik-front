export function clamp(value, min = 0, max = 1) {
  if (!Number.isFinite(value)) {
    return min;
  }

  if (value < min) {
    return min;
  }

  if (value > max) {
    return max;
  }

  return value;
}

function getNextTimestamp(lines, lineIndex, wordIndex) {
  const line = lines[lineIndex];
  const words = line?.words ?? [];
  const nextWord = words[wordIndex + 1];

  if (nextWord && Number.isFinite(nextWord.timeMs)) {
    return nextWord.timeMs;
  }

  const nextLine = lines[lineIndex + 1];
  if (!nextLine) {
    return undefined;
  }

  if (Array.isArray(nextLine.words) && nextLine.words.length > 0) {
    const firstNextWord = nextLine.words[0];

    if (Number.isFinite(firstNextWord.timeMs)) {
      return firstNextWord.timeMs;
    }
  }

  if (Number.isFinite(nextLine.timeMs)) {
    return nextLine.timeMs;
  }

  return undefined;
}

export function calculateWordProgress(lines, activeLineIndex, activeWordIndex, effectiveTimeMs) {
  if (!Array.isArray(lines) || lines.length === 0) {
    return { progress: 0, hasTiming: false };
  }

  if (activeLineIndex < 0 || activeWordIndex < 0) {
    return { progress: 0, hasTiming: false };
  }

  const line = lines[activeLineIndex];
  const words = line?.words ?? [];
  const word = words[activeWordIndex];

  if (!word || !Number.isFinite(word.timeMs)) {
    return { progress: 0, hasTiming: false };
  }

  const startTime = word.timeMs;
  const endTime = getNextTimestamp(lines, activeLineIndex, activeWordIndex);

  if (!Number.isFinite(effectiveTimeMs)) {
    return { progress: 0, hasTiming: Boolean(endTime) };
  }

  if (!Number.isFinite(endTime) || endTime <= startTime) {
    return {
      progress: effectiveTimeMs >= startTime ? 1 : 0,
      hasTiming: false,
    };
  }

  const rawProgress = (effectiveTimeMs - startTime) / (endTime - startTime);
  return {
    progress: clamp(rawProgress),
    hasTiming: true,
  };
}

export default calculateWordProgress;
