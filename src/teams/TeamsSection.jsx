import Section from '../components/Section.jsx'
import Card from '../components/Card.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import { useTeams } from '../hooks/useTeams.js'
import styles from './teams.module.css'

const TeamsSection = () => {
  const { data, error, isLoading, isFetching, isFallback, refetch } = useTeams()

  const description = isFallback
    ? 'Отображаются данные из конфигурации. Подключите API для актуального состава.'
    : 'Основные составы клуба и ключевая информация.'

  return (
    <Section
      title="Команда"
      description={description}
      action={isFetching ? <LoadingSpinner /> : undefined}
    >
      {error && !data ? (
        <ErrorMessage
          title="Не удалось загрузить состав"
          message={error.message}
          onRetry={refetch}
        />
      ) : null}

      {data ? (
        <div className={styles.grid}>
          {data.map((team) => (
            <Card
              key={team.id}
              title={team.name}
              subtitle={`${team.city} • Основан ${team.founded}`}
            >
              <dl className={styles.meta}>
                <div>
                  <dt>Главный тренер</dt>
                  <dd>{team.coach}</dd>
                </div>
                <div>
                  <dt>Арена</dt>
                  <dd>{team.arena}</dd>
                </div>
                <div>
                  <dt>Конференция</dt>
                  <dd>{team.conference}</dd>
                </div>
                {team.website ? (
                  <div>
                    <dt>Сайт</dt>
                    <dd>
                      <a
                        href={team.website}
                        className={styles.link}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Перейти
                      </a>
                    </dd>
                  </div>
                ) : null}
              </dl>
            </Card>
          ))}
        </div>
      ) : null}

      {isLoading && !data ? <LoadingSpinner /> : null}
    </Section>
  )
}

export default TeamsSection
