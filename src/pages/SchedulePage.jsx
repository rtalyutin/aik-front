import { Helmet } from 'react-helmet-async'
import ScheduleSection from '../schedule/ScheduleSection.jsx'
import styles from './page.module.css'

const SchedulePage = () => (
  <div className={styles.wrapper}>
    <Helmet>
      <title>Расписание</title>
      <meta
        name="description"
        content="Календарь матчей команды AIK Front и ссылки на трансляции."
      />
    </Helmet>
    <header className={styles.header}>
      <h1>Расписание матчей</h1>
      <p>Следите за датами игр и обновлениями трансляций в режиме реального времени.</p>
    </header>
    <ScheduleSection />
  </div>
)

export default SchedulePage
