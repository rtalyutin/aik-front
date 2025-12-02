import React, { useCallback, useMemo } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import styles from './Layout.module.css';

const Layout = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  const handleLogout = useCallback(() => {
    logout();
    navigate('/aik2', { replace: true });
  }, [logout, navigate]);

  const navItems = useMemo(() => {
    if (isAuthenticated) {
      return [
        { label: 'Караоке', to: '/karaoke', ariaLabel: 'Перейти на страницу караоке' },
        {
          label: 'ИИ-Караоке',
          to: '/ai-karaoke',
          ariaLabel: 'Перейти на страницу ИИ-караоке',
        },
        { label: 'Выход', ariaLabel: 'Выйти из аккаунта', onClick: handleLogout },
      ];
    }

    return [
      { label: 'Караоке', to: '/karaoke', ariaLabel: 'Перейти на страницу караоке' },
      { label: 'Вход', to: '/aik2', ariaLabel: 'Перейти на страницу входа' },
    ];
  }, [handleLogout, isAuthenticated]);

  return (
    <div className={styles.appShell}>
      <header className={styles.header}>
        <div className={styles.brand}>Cherry RAiT</div>
        <nav className={styles.nav} aria-label="Основное меню">
          <ul className={styles.navList}>
            {navItems.map((item) => (
              <li key={item.to ?? item.label} className={styles.navItem}>
                {item.to ? (
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
                ) : (
                  <button
                    type="button"
                    className={styles.navButton}
                    onClick={item.onClick}
                    aria-label={item.ariaLabel}
                  >
                    <span className={styles.navLabel}>{item.label}</span>
                  </button>
                )}
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
