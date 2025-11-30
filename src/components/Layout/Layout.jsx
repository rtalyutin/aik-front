import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import styles from './Layout.module.css';

const navItems = [
  { label: 'Караоке', to: '/karaoke', ariaLabel: 'Перейти на страницу караоке' },
  { label: 'Вход', to: '/aik2', ariaLabel: 'Перейти на страницу AIK 2' }
];

const Layout = () => {
  return (
    <div className={styles.appShell}>
      <header className={styles.header}>
        <div className={styles.brand}>Cherry RAiT</div>
        <nav className={styles.nav} aria-label="Основное меню">
          <ul className={styles.navList}>
            {navItems.map((item) => (
              <li key={item.to} className={styles.navItem}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    isActive
                      ? `${styles.navButton} ${styles.navButtonActive}`
                      : styles.navButton
                  }
                  aria-label={item.ariaLabel}
                >
                  <span className={styles.navLabel}>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
