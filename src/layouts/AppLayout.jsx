import { Outlet, ScrollRestoration } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Navigation from '../components/Navigation.jsx'
import Footer from '../components/Footer.jsx'
import styles from './app-layout.module.css'

const AppLayout = () => {
  return (
    <div className={styles.shell}>
      <Helmet defaultTitle="AIK Front" titleTemplate="%s • AIK Front">
        <html lang="ru" />
        <body className={styles.body} />
      </Helmet>
      <a className="visually-hidden" href="#main-content">
        Перейти к основному содержимому
      </a>
      <Navigation />
      <main id="main-content" className={styles.main}>
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration />
    </div>
  )
}

export default AppLayout
