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

const statuses = [
  { label: 'Статус', value: 'в ожидании', tone: 'neutral' },
  { label: 'Очередь', value: '3 заявки', tone: 'accent' },
  { label: 'Тональность', value: 'оригинал', tone: 'neutral' },
  { label: 'Темп', value: '95 BPM', tone: 'neutral' },
]

const App = () => {
  const [isInfographicVisible, setIsInfographicVisible] = useState(true)

  return (
    <div className="karaoke-app">
      <nav className="app-nav" aria-label="Основное меню">
        <ul className="app-nav__list">
          <li className="app-nav__item">
            <span className="app-nav__pill" aria-current="page">
              Музыка
            </span>
          </li>
        </ul>
      </nav>

      <header className="karaoke-header">
        <div className="logo-slot" aria-hidden="true" />
        <div className="title-block">
          <span className="title-badge">новый сервис</span>
          <h1 className="title">Пой со мной!</h1>
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
              <div className="infographic__body">
                <article className="infographic__step infographic__step--source">
                  <h2 className="infographic__step-title">Загрузи трек</h2>
                  <p className="infographic__step-caption">Вставь ссылку или перетащи файл</p>
                  <svg
                    className="infographic__symbol"
                    viewBox="0 0 80 80"
                    role="presentation"
                    aria-hidden="true"
                  >
                    <defs>
                      <linearGradient id="infographicSourceGradient" x1="0" x2="1" y1="1" y2="0">
                        <stop offset="0%" stopColor="rgba(255, 160, 255, 0.9)" />
                        <stop offset="100%" stopColor="rgba(134, 191, 255, 0.9)" />
                      </linearGradient>
                    </defs>
                    <rect
                      x="18"
                      y="12"
                      width="32"
                      height="48"
                      rx="10"
                      stroke="url(#infographicSourceGradient)"
                      strokeWidth="3"
                      fill="none"
                    />
                    <path
                      d="M46 24c6 0 11 5 11 11s-5 11-11 11h-6"
                      stroke="url(#infographicSourceGradient)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                    <path
                      d="M34 35c-6 0-11 5-11 11s5 11 11 11h6"
                      stroke="url(#infographicSourceGradient)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                    <path
                      d="M32 30v14.5a4.5 4.5 0 1 0 3 4.24"
                      stroke="url(#infographicSourceGradient)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                    <circle cx="39" cy="26" r="4" fill="url(#infographicSourceGradient)" />
                  </svg>
                </article>
                <div className="infographic__arrow" aria-hidden="true" />
                <article className="infographic__step infographic__step--cloud">
                  <h2 className="infographic__step-title">AI готовит трек</h2>
                  <p className="infographic__step-caption">Разделяем вокал и строим подсказки</p>
                  <svg
                    className="infographic__symbol"
                    viewBox="0 0 80 80"
                    role="presentation"
                    aria-hidden="true"
                  >
                    <defs>
                      <linearGradient id="infographicCloudGradient" x1="0" x2="1" y1="1" y2="0">
                        <stop offset="0%" stopColor="rgba(138, 173, 255, 0.9)" />
                        <stop offset="100%" stopColor="rgba(164, 255, 255, 0.9)" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M28 46h23a9 9 0 0 0 0-18 14 14 0 0 0-27-3.5A10 10 0 0 0 28 46Z"
                      stroke="url(#infographicCloudGradient)"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                    <circle cx="32" cy="54" r="4" fill="url(#infographicCloudGradient)" />
                    <circle cx="48" cy="54" r="4" fill="url(#infographicCloudGradient)" />
                    <rect
                      x="28"
                      y="54"
                      width="24"
                      height="6"
                      rx="3"
                      fill="url(#infographicCloudGradient)"
                    />
                  </svg>
                </article>
                <div className="infographic__arrow" aria-hidden="true" />
                <article className="infographic__step infographic__step--stage">
                  <h2 className="infographic__step-title">Выходи на сцену</h2>
                  <p className="infographic__step-caption">Следи за подсказками и пой точно</p>
                  <svg
                    className="infographic__symbol"
                    viewBox="0 0 80 80"
                    role="presentation"
                    aria-hidden="true"
                  >
                    <defs>
                      <linearGradient id="infographicStageGradient" x1="0" x2="1" y1="1" y2="0">
                        <stop offset="0%" stopColor="rgba(92, 159, 255, 0.9)" />
                        <stop offset="100%" stopColor="rgba(184, 96, 255, 0.9)" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M34 48 46 36"
                      stroke="url(#infographicStageGradient)"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                    <path
                      d="M46.5 35.5a7 7 0 1 1 9.9 9.9"
                      stroke="url(#infographicStageGradient)"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                    <circle
                      cx="50"
                      cy="30"
                      r="6"
                      stroke="url(#infographicStageGradient)"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      d="M24 54c0-8 4-12 10-12"
                      stroke="url(#infographicStageGradient)"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                    <path
                      d="M28 46a8 8 0 1 0-9-8"
                      stroke="url(#infographicStageGradient)"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </svg>
                </article>
              </div>
            </section>
          )}
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

        <main id="music" className="player" aria-labelledby="player-title">
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
