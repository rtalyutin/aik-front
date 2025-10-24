import Section from '../components/Section.jsx'
import Card from '../components/Card.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import { useSchedule } from '../hooks/useSchedule.js'
import { formatDateTime } from '../utils/formatDate.js'
import styles from './schedule.module.css'

const ScheduleSection = () => {
  const { data, error, isLoading, isFetching, isFallback, refetch } = useSchedule()

  const description = isFallback
    ? 'Отображены резервные матчи. Проверьте API, чтобы получить актуальное расписание.'
    : 'Ближайшие матчи и трансляции клуба.'

  return (
    <Section
      title="Расписание"
      description={description}
      action={isFetching ? <LoadingSpinner /> : undefined}
    >
      {error && !data ? (
        <ErrorMessage
          title="Не удалось загрузить расписание"
          message={error.message}
          onRetry={refetch}
        />
      ) : null}

      {data ? (
        <div className={styles.list}>
          {data.map((game) => (
            <Card
              key={game.id}
              title={`VS ${game.opponent}`}
              subtitle={game.location}
              meta={formatDateTime(game.date)}
            >
              <div className={styles.details}>
                {game.competition ? <p className={styles.competition}>{game.competition}</p> : null}
                {game.broadcast ? (
                  <a href={game.broadcast} className={styles.link} target="_blank" rel="noreferrer">
                    Смотреть трансляцию
                  </a>
                ) : (
                  <p className={styles.note}>Трансляция будет объявлена позже</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : null}

      {isLoading && !data ? <LoadingSpinner /> : null}
    </Section>
  )
}

export default ScheduleSection
