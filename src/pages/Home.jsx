import { Helmet } from 'react-helmet-async'
import NewsSection from '../news/NewsSection.jsx'
import ScheduleSection from '../schedule/ScheduleSection.jsx'
import TeamsSection from '../teams/TeamsSection.jsx'
import styles from './home.module.css'

const Home = () => (
  <div className={styles.wrapper}>
    <Helmet>
      <title>Главная</title>
      <meta
        name="description"
        content="Операционная панель клуба AIK Front: новости, расписание матчей и состав команды."
      />
    </Helmet>
    <section className={styles.hero}>
      <h1 className={styles.title}>AIK Front — единая панель управления клубом</h1>
      <p className={styles.lead}>
        Собирайте аналитику, обновляйте расписание и публикуйте новости с одного экрана. Данные
        синхронизируются с внешним API и доступны офлайн.
      </p>
    </section>
    <NewsSection />
    <ScheduleSection />
    <TeamsSection />
  </div>
)

export default Home
