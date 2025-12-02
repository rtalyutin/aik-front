export default {
  title: 'ИИ-Караоке',
  description:
    'Загрузите файл с вокалом или полноценным треком, выберите язык транскрипции и создайте задачу на разделение дорожек.',
  form: {
    fileLabel: 'Файл с треком',
    languageLabel: 'Язык транскрипции',
    languagePlaceholder: 'Выберите язык',
    submitLabel: 'Создать задачу',
    loadingLabel: 'Отправляем...'
  },
  validationMessages: {
    fileRequired: 'Добавьте файл перед отправкой.',
    langRequired: 'Выберите язык распознавания.',
  },
  statusHeading: 'Статус задачи',
  timelineHeading: 'Транскрипт',
  filesHeading: 'Дорожки и файлы',
};
