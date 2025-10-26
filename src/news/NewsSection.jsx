import Section from '../components/Section.jsx'
import Card from '../components/Card.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import { useNews } from '../hooks/useNews.js'
import { formatDateTime } from '../utils/formatDate.js'
import styles from './news.module.css'

const NewsSection = () => {
  const { data, error, isLoading, isFetching, isFallback, refetch } = useNews()

  const description = isFallback
    ? 'Отображаются резервные данные. Проверьте подключение к API, чтобы увидеть актуальные новости.'
    : 'Актуальные новости клуба и объявления пресс-службы.'

  return (
    <Section
      title="Новости"
      description={description}
      action={isFetching ? <LoadingSpinner /> : undefined}
    >
      {error && !data ? (
        <ErrorMessage title="Ошибка загрузки" message={error.message} onRetry={refetch} />
      ) : null}

      {data ? (
        <div className={styles.grid}>
          {data.map((item) => (
            <Card
              key={item.id}
              title={item.title}
              subtitle={item.summary}
              meta={formatDateTime(item.publishedAt)}
            >
              <div className={styles.meta}>
                <a
                  className={styles.link}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Читать полностью
                </a>
                {item.tags?.length ? (
                  <ul className={styles.tags}>
                    {item.tags.map((tag) => (
                      <li key={tag}>#{tag}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      ) : null}

      {isLoading && !data ? <LoadingSpinner /> : null}
    </Section>
  )
}

export default NewsSection
