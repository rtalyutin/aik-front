import tracksData from './text.json';

const tracksSource = import.meta.env?.VITE_READY_TRACKS_ENDPOINT || '/api/karaoke-tracks';

const localTracks = Array.isArray(tracksData) ? tracksData : [];

export default {
  title: 'Караоке-сцена',
  description: 'Выбирайте любимые треки и пойте вместе с Cherry RAiT.',
  tracksHeading: 'Плейлист',
  playerHeading: 'Караоке-плеер',
  loadingMessage: 'Загружаем плейлист…',
  emptyState: 'Нет доступных треков. Попробуйте обновить чуть позже.',
  errorFallback: 'Не удалось загрузить список треков. Попробуйте обновить страницу.',
  playerPlaceholder: 'Выберите трек, чтобы начать петь.',
  defaultCaptions: '/karaoke-subtitles.vtt',
  tracksSource, // Используется реальный API для списка готовых треков; если сервер недоступен, fallback — статичный json
  localTracks, // Локальный плейлист из text.json — основной источник для публичной страницы
  queueInstructions: [
    'Добавьте треки в очередь, нажимая на понравившиеся композиции в плейлисте.',
    'Перетащите трек в списке очереди, чтобы поменять порядок выступлений.',
    'Нажмите «Убрать из очереди», если трек больше не нужен в списке.'
  ],
  pagination: {
    pageSize: 20,
    maxVisiblePages: 5,
    labels: {
      previous: '<',
      next: '>',
      page: '',
      navigation: 'Стр'
    }
  }
};
