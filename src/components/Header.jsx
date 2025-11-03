import React from 'react';
import Button from './Button';

const accentOptions = [
  { id: 'fox-dream', label: 'Лисий сон', icon: '🦊' },
  { id: 'blue', label: 'Синий', icon: '🎵' },
];

const Header = ({ theme, accentPreset, onToggleTheme, onSelectAccent }) => {
  const isDark = theme === 'dark';

  return (
    <header className="app-header" role="banner">
      <div className="app-header__branding" aria-label="Cherry RAiT — Пой со мной">
        <div className="app-header__logo" aria-hidden="true">
          <svg className="app-header__logo-icon" viewBox="0 0 48 48" focusable="false" aria-hidden="true">
            <defs>
              <linearGradient id="cherryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--accent-solid)" />
                <stop offset="100%" stopColor="var(--accent-solid-strong)" />
              </linearGradient>
            </defs>
            <circle cx="17" cy="28" r="9" fill="url(#cherryGradient)" />
            <circle cx="31" cy="26" r="10" fill="url(#cherryGradient)" opacity="0.85" />
            <path
              d="M16 18c3-6 6-10 14-11 2-.2 4 .6 5.5 1.8"
              fill="none"
              stroke="var(--accent-stroke)"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div className="app-header__text">
          <span className="app-header__title">Cherry RAiT</span>
          <span className="app-header__subtitle">Пой со мной</span>
        </div>
      </div>
      <nav className="app-header__actions" aria-label="Настройки интерфейса">
        <div className="app-header__accent" role="group" aria-label="Выбор цветового акцента">
          {accentOptions.map((option) => {
            const isActive = accentPreset === option.id;
            const buttonClasses = ['app-header__accent-button'];

            if (isActive) {
              buttonClasses.push('app-header__accent-button--active');
            }

            return (
              <Button
                key={option.id}
                type="button"
                variant="ghost"
                className={buttonClasses.join(' ')}
                aria-pressed={isActive}
                onClick={() => onSelectAccent && onSelectAccent(option.id)}
              >
                <span aria-hidden="true">{option.icon}</span>
                {option.label}
              </Button>
            );
          })}
        </div>
        <Button
          type="button"
          variant="ghost"
          className="app-header__theme-toggle"
          aria-pressed={isDark}
          aria-label="Переключить тему"
          onClick={onToggleTheme}
        >
          {isDark ? 'Тёмная тема' : 'Светлая тема'}
        </Button>
      </nav>
    </header>
  );
};

export default Header;
