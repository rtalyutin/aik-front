import { useState } from 'react'

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

const statusSummary = [
  { label: 'Статус', value: 'в ожидании' },
  { label: 'Очередь', value: '3 заявки' },
  { label: 'Темп', value: '95 BPM' },
]

const App = () => {
  const [isInfographicVisible, setIsInfographicVisible] = useState(true)

  return (
    <div className="app">
      <nav className="app__nav" aria-label="Основное меню">
        <ul className="app__nav-list">
          <li className="app__nav-item">
            <span className="app__nav-pill" aria-current="page">
              Музыка
            </span>
          </li>
        </ul>
      </nav>

      <header className="app__hero">
        <div className="app__hero-text">
          <span className="app__badge">новый сервис</span>
          <h1 className="app__title">Пой со мной!</h1>
          <p className="app__subtitle">AI караоке для уверенного выступления.</p>
        </div>

        {isInfographicVisible && (
          <section className="infographic" aria-label="Как работает AI караоке">
            <header className="infographic__header">
              <div>
                <p className="infographic__title">Три шага, чтобы начать</p>
                <p className="infographic__subtitle">От загрузки до выступления за пару минут</p>
              </div>
              <button
                type="button"
                className="infographic__close"
                onClick={() => setIsInfographicVisible(false)}
                aria-label="Скрыть инфографику"
              >
                <span aria-hidden="true">×</span>
              </button>
            </header>

            <ol className="infographic__steps">
              <li className="infographic__step">
                <h2 className="infographic__step-title">1. Загрузи трек</h2>
                <p className="infographic__step-caption">Вставь ссылку или перетащи файл</p>
              </li>
              <li className="infographic__step">
                <h2 className="infographic__step-title">2. AI готовит трек</h2>
                <p className="infographic__step-caption">Разделяем вокал и строим подсказки</p>
              </li>
              <li className="infographic__step">
                <h2 className="infographic__step-title">3. Выходи на сцену</h2>
                <p className="infographic__step-caption">Следи за подсказками и пой точно</p>
              </li>
            </ol>
          </section>
        )}
      </header>

      <div className="app__layout">
        <aside className="app__panel" aria-labelledby="current-track-title">
          <div className="app__panel-card">
            <span className="app__panel-badge">демо-трек · этап</span>
            <h2 id="current-track-title" className="app__panel-title">
              Очень длинное название трека чтобы проверить обрезку...
            </h2>
            <p className="app__panel-subtitle">Название трека готово</p>
          </div>

          <ul className="app__panel-list" aria-label="Список следующих треков">
            {upcomingTracks.map((track, index) => (
              <li key={`${track.title}-${index}`} className="app__panel-list-item">
                <div>
                  <p className="app__panel-list-title">{track.title}</p>
                  <p className="app__panel-list-status">{track.status}</p>
                </div>
                <span className="app__panel-list-badge">{track.badge}</span>
              </li>
            ))}
          </ul>
        </aside>

        <main className="app__main" aria-labelledby="player-title">
          <h2 id="player-title" className="app__main-heading">
            Активный текст песни
          </h2>

          <div className="app__player">
            <button className="app__play" type="button" aria-label="Запустить демо-трек">
              <span className="app__play-icon" aria-hidden="true" />
              <span className="app__play-label">Слушать демо</span>
            </button>
          </div>

          <section className="app__lyrics" aria-live="polite">
            <ul className="app__lyrics-list">
              {demoLyrics.map((line, index) => (
                <li
                  key={line}
                  className={`app__lyrics-item ${index === 0 ? 'app__lyrics-item--active' : ''}`}
                >
                  {line}
                </li>
              ))}
            </ul>
          </section>
        </main>

        <aside className="app__status" aria-label="Состояние системы">
          <h2 className="app__status-title">Состояния</h2>
          <dl className="app__status-list">
            {statusSummary.map((status) => (
              <div key={status.label} className="app__status-item">
                <dt>{status.label}</dt>
                <dd>{status.value}</dd>
              </div>
            ))}
          </dl>
          <footer className="app__status-footer">
            <span className="app__status-time">3:11</span>
            <span className="app__status-duration">5:45</span>
          </footer>
        </aside>
      </div>
    </div>
  )
}

export default App
