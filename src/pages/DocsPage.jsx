import { Helmet } from 'react-helmet-async'
import Section from '../components/Section.jsx'
import styles from './page.module.css'

const DocsPage = () => (
  <div className={styles.wrapper}>
    <Helmet>
      <title>Документация</title>
      <meta
        name="description"
        content="Центр документации AIK Front: руководство по запуску проекта, API и справочные материалы."
      />
    </Helmet>
    <header className={styles.header}>
      <h1>Документация AIK Front</h1>
      <p>
        Сборник руководств и справочных материалов, который поможет быстрее разобраться в
        архитектуре и возможностях платформы.
      </p>
    </header>
    <Section
      title="С чего начать"
      description="Основные документы, которые пригодятся новым участникам команды."
    >
      <ul>
        <li>
          <strong>Обзор проекта:</strong>
          архитектура, ключевые пакеты и процессы релиза.
        </li>
        <li>
          <strong>Гайд по разработке:</strong>
          требования к окружению, запуск локально и советы по отладке.
        </li>
        <li>
          <strong>Стандарты код-ревью:</strong>
          критерии качества, чек-листы и лучшие практики.
        </li>
      </ul>
    </Section>
    <Section
      title="API и интеграции"
      description="Документация по публичным и внутренним интерфейсам AIK Front."
    >
      <ul>
        <li>
          <strong>REST API:</strong>
          описание эндпоинтов, схемы запросов и ответов.
        </li>
        <li>
          <strong>Аутентификация:</strong>
          способы подключения, управление токенами и примеры использования.
        </li>
        <li>
          <strong>Вебхуки:</strong>
          события, структура payload и рекомендации по обработке.
        </li>
      </ul>
    </Section>
    <Section
      title="Дополнительные ресурсы"
      description="Материалы для углубленного изучения платформы."
    >
      <ul>
        <li>
          <strong>UI-кит:</strong>
          коллекция компонентов и паттернов интерфейса.
        </li>
        <li>
          <strong>Руководство по тестированию:</strong>
          типы тестов, шаблоны и best practices.
        </li>
        <li>
          <strong>FAQ:</strong>
          ответы на популярные вопросы и советы по устранению неполадок.
        </li>
      </ul>
    </Section>
  </div>
)

export default DocsPage
