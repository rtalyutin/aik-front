import { NavLink } from 'react-router-dom'
import styles from './navigation.module.css'

const Navigation = () => {
  return (
    <header className={styles.header}>
      <div className={styles.branding}>
        <span className={styles.logo} aria-hidden="true">
          ⚡
        </span>
        <div>
          <p className={styles.title}>AIK Front</p>
          <p className={styles.subtitle}>Панель управления спортивного клуба</p>
        </div>
      </div>
      <nav aria-label="Основная навигация" className={styles.nav}>
        <ul className={styles.list}>
          <li>
            <NavLink
              to="/"
              className={({ isActive }) => (isActive ? styles.active : undefined)}
              end
            >
              Главная
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/news"
              className={({ isActive }) => (isActive ? styles.active : undefined)}
            >
              Новости
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/schedule"
              className={({ isActive }) => (isActive ? styles.active : undefined)}
            >
              Расписание
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/teams"
              className={({ isActive }) => (isActive ? styles.active : undefined)}
            >
              Команда
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/player"
              className={({ isActive }) => (isActive ? styles.active : undefined)}
            >
              Плеер
            </NavLink>
          </li>
        </ul>
      </nav>
    </header>
  )
}

export default Navigation
