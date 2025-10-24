import { Helmet } from 'react-helmet-async'
import NewsSection from '../news/NewsSection.jsx'
import styles from './page.module.css'

const NewsPage = () => (
  <div className={styles.wrapper}>
    <Helmet>
      <title>Новости</title>
      <meta name="description" content="Все последние новости клуба AIK Front." />
    </Helmet>
    <header className={styles.header}>
      <h1>Новости клуба</h1>
      <p>Самая свежая информация из пресс-службы и академии AIK Front.</p>
    </header>
    <NewsSection />
  </div>
)

export default NewsPage
