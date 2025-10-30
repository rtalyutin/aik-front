import React from 'react';
import Button from './Button';

const Header = ({ theme, onToggleTheme }) => {
  return (
    <header className="app-header" role="banner">
      <div className="app-header__branding" aria-label="AI Karaoke brand">
        <div className="app-header__logo" aria-hidden="true">🎤</div>
        <div className="app-header__text">
          <span className="app-header__title">AI Karaoke</span>
          <span className="app-header__subtitle">Sing with intelligent accompaniment</span>
        </div>
      </div>
      <nav className="app-header__actions" aria-label="Primary">
        <Button
          type="button"
          variant="ghost"
          aria-pressed={theme === 'dark'}
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          onClick={onToggleTheme}
        >
          {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
        </Button>
      </nav>
    </header>
  );
};

export default Header;
