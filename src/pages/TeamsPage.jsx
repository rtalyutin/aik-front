import { Helmet } from 'react-helmet-async'
import TeamsSection from '../teams/TeamsSection.jsx'
import styles from './page.module.css'

const TeamsPage = () => (
  <div className={styles.wrapper}>
    <Helmet>
      <title>Команда</title>
      <meta name="description" content="Составы AIK Front, тренеры и инфраструктура клуба." />
    </Helmet>
    <header className={styles.header}>
      <h1>Команды клуба</h1>
      <p>Основная и молодёжная команды, информация о тренерах и инфраструктуре.</p>
    </header>
    <TeamsSection />
  </div>
)

export default TeamsPage
