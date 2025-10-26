export function getActiveLine(lines, currentMs) {
  if (!Array.isArray(lines) || typeof currentMs !== 'number') {
    return { line: null, index: -1 }
  }

  if (lines.length === 0) {
    return { line: null, index: -1 }
  }

  for (let index = lines.length - 1; index >= 0; index -= 1) {
    const line = lines.at(index)
    if (typeof line.time !== 'number') {
      continue
    }

    if (currentMs >= line.time) {
      return { line, index }
    }
  }

  return { line: lines[0], index: 0 }
}

export function getActiveWord(line, currentMs) {
  if (!line || !Array.isArray(line.words) || typeof currentMs !== 'number') {
    return { word: null, index: -1 }
  }

  const { words } = line
  for (let index = words.length - 1; index >= 0; index -= 1) {
    const word = words.at(index)
    if (typeof word.time !== 'number') {
      continue
    }

    if (currentMs >= line.time + word.time) {
      return { word, index }
    }
  }

  return { word: words[0] ?? null, index: words.length ? 0 : -1 }
}
