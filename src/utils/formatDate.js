const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export const formatDateTime = (value) => {
  try {
    return dateFormatter.format(new Date(value))
  } catch {
    return value
  }
}

const dateOnlyFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})

export const formatDate = (value) => {
  try {
    return dateOnlyFormatter.format(new Date(value))
  } catch {
    return value
  }
}
