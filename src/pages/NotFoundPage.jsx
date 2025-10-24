import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import styles from './page.module.css'

const NotFoundPage = () => (
  <div className={styles.wrapper}>
    <Helmet>
      <title>Страница не найдена</title>
      <meta name="robots" content="noindex" />
    </Helmet>
    <header className={styles.header}>
      <h1>404</h1>
      <p>Страница не найдена. Возможно, она была удалена или перемещена.</p>
      <Link to="/" className={styles.link}>
        Вернуться на главную
      </Link>
    </header>
  </div>
)

export default NotFoundPage
