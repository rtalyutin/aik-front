const formatMessage = (level, args) => {
  const [first, ...rest] = args
  const prefix = `[AIK Front][${level.toUpperCase()}]`
  if (typeof first === 'string') {
    return [`${prefix} ${first}`, ...rest]
  }
  return [prefix, first, ...rest]
}

const emit = (level, args) => {
  const payload = formatMessage(level, args)
  switch (level) {
    case 'info':
      console.info(...payload)
      break
    case 'warn':
      console.warn(...payload)
      break
    case 'error':
      console.error(...payload)
      break
    default:
      console.log(...payload)
  }
}

export const logger = {
  info: (...args) => emit('info', args),
  warn: (...args) => emit('warn', args),
  error: (...args) => emit('error', args),
}
