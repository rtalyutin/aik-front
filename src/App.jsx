import './App.css'

const demoLyrics = [
  'Строка текста №1',
  'Строка текста №2',
  'Строка текста №3',
  'Строка текста №4',
  'Строка текста №5',
]

const upcomingTracks = [
  { title: 'Название трека', status: 'готово', badge: 'впереди' },
  { title: 'Название трека', status: 'готово', badge: 'очередь' },
  { title: 'Название трека', status: 'готово', badge: 'зарезервировано' },
]

const statuses = [
  { label: 'Статус', value: 'в ожидании', tone: 'neutral' },
  { label: 'Очередь', value: '3 заявки', tone: 'accent' },
  { label: 'Тональность', value: 'оригинал', tone: 'neutral' },
  { label: 'Темп', value: '95 BPM', tone: 'neutral' },
]

const App = () => {
  return (
    <div className="karaoke-app">
      <header className="karaoke-header">
        <div className="logo-slot" aria-hidden="true" />
        <div className="title-block">
          <span className="title-badge">новый сервис</span>
          <h1 className="title">Пой со мной!</h1>
        </div>
      </header>

      <div className="layout">
        <aside className="track-panel" aria-labelledby="current-track-title">
          <div className="track-panel__card">
            <div className="track-panel__header">
              <div className="track-panel__indicator" />
              <span className="track-panel__badge">демо-трек · этап</span>
            </div>
            <h2 id="current-track-title" className="track-panel__title">
              Очень длинное название трека чтобы проверить обрезку...
            </h2>
            <p className="track-panel__subtitle">Название трека готово</p>
          </div>

          <ul className="track-list" aria-label="Список следующих треков">
            {upcomingTracks.map((track, index) => (
              <li key={`${track.title}-${index}`} className="track-list__item">
                <div>
                  <p className="track-list__title">{track.title}</p>
                  <p className="track-list__status">{track.status}</p>
                </div>
                <span className="track-list__badge">{track.badge}</span>
              </li>
            ))}
          </ul>
        </aside>

        <main className="player" aria-labelledby="player-title">
          <div className="player__controls">
            <button className="play-button" type="button" aria-label="Запустить демо-трек">
              <span className="play-button__icon" />
            </button>
          </div>
          <section className="lyrics" aria-live="polite">
            <h2 id="player-title" className="visually-hidden">
              Активный текст песни
            </h2>
            <ul className="lyrics__list">
              {demoLyrics.map((line, index) => (
                <li
                  key={line}
                  className={`lyrics__item ${index === 0 ? 'lyrics__item--active' : ''}`}
                >
                  {line}
                </li>
              ))}
            </ul>
          </section>
        </main>

        <aside className="status-panel" aria-label="Состояние системы">
          <div className="status-panel__card">
            <p className="status-panel__title">состояния</p>
            <dl className="status-panel__list">
              {statuses.map((status) => (
                <div
                  key={status.label}
                  className={`status-panel__item status-panel__item--${status.tone}`}
                >
                  <dt>{status.label}</dt>
                  <dd>{status.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="status-panel__footer">
            <span className="status-panel__time">3:11</span>
            <span className="status-panel__duration">5:45</span>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default App
