import React from 'react';
import { NavLink } from 'react-router-dom';
import cherryLogoUrl from '../assets/cherry-logo.svg';
import Button from './Button';

const accentOptions = [
  { id: 'crimson-sonata', label: 'Багровая соната', icon: '🎻' },
  { id: 'glacier-mist', label: 'Ледяная дымка', icon: '🧊' },
  { id: 'neon-nocturne', label: 'Неоновая ноктюрн', icon: '🌃' },
];

const themeModes = {
  light: { label: 'Сияние рассвета', icon: '🌞' },
  dark: { label: 'Полярная ночь', icon: '🌙' },
};

const navigationItems = [
  { id: 'processing', to: '/', label: 'Обработка' },
  { id: 'karaoke', to: '/karaoke', label: 'Караоке' },
  { id: 'ready-tracks', to: '/ready-tracks', label: 'Готовые треки' },
];

const Header = ({ theme, accentPreset, onToggleTheme, onSelectAccent }) => {
  const isDark = theme === 'dark';
  const activeMode = isDark ? themeModes.dark : themeModes.light;
  const nextMode = isDark ? themeModes.light : themeModes.dark;

  return (
    <header className="app-header" role="banner">
      <div
        className="app-header__branding"
        aria-label="Cherry RAiT — Пой со мной"
      >
        <div className="app-header__logo" aria-hidden="true">
          <img
            src={cherryLogoUrl}
            alt=""
            role="presentation"
            className="app-header__logo-icon"
          />
        </div>
        <div className="app-header__text">
          <span className="app-header__title">Cherry RAiT</span>
          <span className="app-header__subtitle">Пой со мной</span>
        </div>
      </div>
      <div className="app-header__controls">
        <nav className="app-header__nav" aria-label="Основная навигация">
          {navigationItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => {
                const classes = ['app-header__nav-link'];

                if (isActive) {
                  classes.push('app-header__nav-link--active');
                }

                return classes.join(' ');
              }}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div
          className="app-header__actions"
          aria-label="Настройки интерфейса"
          role="group"
        >
          <div
            className="app-header__accent"
            role="group"
            aria-label="Выбор цветового акцента"
          >
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
            aria-label={`Переключить тему: сейчас «${activeMode.label}», перейти на «${nextMode.label}»`}
            onClick={onToggleTheme}
            icon={activeMode.icon}
          >
            {activeMode.label}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
