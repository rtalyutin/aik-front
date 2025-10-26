import { getActiveLine, getActiveWord } from '../lyrics.js'

describe('getActiveLine', () => {
  const lines = [
    { time: 0, text: 'first' },
    { time: 1200, text: 'second' },
    { time: 3400, text: 'third' },
  ]

  it('returns the first line when before any timestamps', () => {
    const result = getActiveLine(lines, 100)

    expect(result.index).toBe(0)
    expect(result.line).toBe(lines[0])
  })

  it('returns the matching line for the current timestamp', () => {
    const result = getActiveLine(lines, 2200)

    expect(result.index).toBe(1)
    expect(result.line).toBe(lines[1])
  })

  it('returns fallback when no lines available', () => {
    const result = getActiveLine([], 500)

    expect(result).toEqual({ line: null, index: -1 })
  })

  it('ignores invalid line data', () => {
    const malformed = [...lines, { text: 'no time' }]
    const result = getActiveLine(malformed, 6000)

    expect(result.index).toBe(2)
    expect(result.line).toBe(lines[2])
  })
})

describe('getActiveWord', () => {
  const line = {
    time: 2000,
    words: [
      { text: 'a', time: 0 },
      { text: 'b', time: 400 },
      { text: 'c', time: 900 },
    ],
  }

  it('returns the first word when before any timestamps', () => {
    const result = getActiveWord(line, 2050)

    expect(result.index).toBe(0)
    expect(result.word).toBe(line.words[0])
  })

  it('returns the active word relative to the line time', () => {
    const result = getActiveWord(line, 2500)

    expect(result.index).toBe(1)
    expect(result.word).toBe(line.words[1])
  })

  it('falls back when words are missing', () => {
    const result = getActiveWord(null, 2500)

    expect(result).toEqual({ word: null, index: -1 })
  })

  it('ignores words without timestamps', () => {
    const customLine = {
      time: 100,
      words: [...line.words, { text: 'no-time' }],
    }

    const result = getActiveWord(customLine, 4000)

    expect(result.index).toBe(2)
    expect(result.word).toBe(line.words[2])
  })
})
