import ThemeSwitch from './ThemeSwitch.jsx'

export default function Header() {
  return (
    <header className="header">
      <div className="header__brand">
        <span className="header__logo" aria-hidden="true">
          🎤
        </span>
        <span>Пой со мной!</span>
      </div>
      <ThemeSwitch />
    </header>
  )
}
