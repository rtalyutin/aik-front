import React, { useMemo, useState } from 'react';
import config from './config.js';
import styles from './AiKaraokePage.module.css';

const AiKaraokePage = () => {
  const [file, setFile] = useState(null);
  const [langCode, setLangCode] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);
  const [error, setError] = useState(null);
  const [taskData, setTaskData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const availableLanguages = useMemo(
    () => [
      { value: 'ru', label: 'Русский' },
      { value: 'en', label: 'English' },
      { value: 'es', label: 'Español' },
      { value: 'fr', label: 'Français' },
      { value: 'de', label: 'Deutsch' },
    ],
    [],
  );

  const resetErrors = () => {
    setValidationErrors([]);
    setError(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    resetErrors();

    const errors = [];

    if (!file) {
      errors.push(config.validationMessages.fileRequired);
    }

    if (!langCode) {
      errors.push(config.validationMessages.langRequired);
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('lang_code', langCode);

      const response = await fetch('/api/karaoke-tracks/create-task-from-file', {
        method: 'POST',
        body: formData,
      });

      const contentType = response.headers.get('content-type');
      const isJson = typeof contentType === 'string' && contentType.includes('application/json');
      const payload = isJson ? await response.json() : null;

      if (!response.ok) {
        setError(
          payload ?? {
            message: 'Не удалось создать задачу. Попробуйте ещё раз.',
          },
        );
        return;
      }

      const normalized = payload?.data ?? payload;
      setTaskData(normalized ?? null);
    } catch (fetchError) {
      setError({
        message: 'Ошибка сети: не удалось отправить запрос.',
        details: fetchError.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className={styles.page}>
      <h1 className={styles.title}>{config.title}</h1>
      <p className={styles.description}>{config.description}</p>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="karaoke-file">
            {config.form.fileLabel}
          </label>
          <input
            className={styles.input}
            id="karaoke-file"
            name="file"
            type="file"
            accept="audio/*,video/*"
            onChange={(event) => {
              const selectedFile = event.target.files?.[0] ?? null;
              setFile(selectedFile);
            }}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="karaoke-lang">
            {config.form.languageLabel}
          </label>
          <select
            className={styles.input}
            id="karaoke-lang"
            name="lang_code"
            value={langCode}
            onChange={(event) => setLangCode(event.target.value)}
          >
            <option value="">{config.form.languagePlaceholder}</option>
            {availableLanguages.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {validationErrors.length > 0 && (
          <div className={styles.validation} role="alert">
            <ul className={styles.validationList}>
              {validationErrors.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          </div>
        )}

        {error && (
          <div className={styles.error} role="alert">
            {error.code && <p className={styles.errorCode}>Код: {error.code}</p>}
            {error.message && <p>{error.message}</p>}
            {error.details && <p className={styles.errorDetails}>{error.details}</p>}
          </div>
        )}

        <button className={styles.submit} type="submit" disabled={isLoading}>
          {isLoading ? config.form.loadingLabel : config.form.submitLabel}
        </button>
      </form>

      {taskData && (
        <div className={styles.result}>
          <h2 className={styles.subheading}>{config.statusHeading}</h2>
          <dl className={styles.metaList}>
            <div>
              <dt>ID</dt>
              <dd>{taskData.id ?? '—'}</dd>
            </div>
            <div>
              <dt>Статус</dt>
              <dd>{taskData.status ?? '—'}</dd>
            </div>
            <div>
              <dt>Язык</dt>
              <dd>{taskData.lang_code ?? '—'}</dd>
            </div>
          </dl>

          <h3 className={styles.subheading}>{config.filesHeading}</h3>
          <ul className={styles.fileList}>
            {taskData.base_track_file && <li>Исходный файл: {taskData.base_track_file}</li>}
            {taskData.vocal_file && <li>Вокал: {taskData.vocal_file}</li>}
            {taskData.instrumental_file && <li>Минус: {taskData.instrumental_file}</li>}
            {taskData.result_track_id && <li>Идентификатор результата: {taskData.result_track_id}</li>}
          </ul>

          {Array.isArray(taskData.transcript) && taskData.transcript.length > 0 && (
            <div className={styles.timeline}>
              <h3 className={styles.subheading}>{config.timelineHeading}</h3>
              <ol className={styles.timelineList}>
                {taskData.transcript.map((segment, index) => (
                  <li key={`${segment.text}-${index}`} className={styles.timelineItem}>
                    <div className={styles.timelineMeta}>
                      <span>
                        {segment.start}s — {segment.end}s
                      </span>
                    </div>
                    <p className={styles.timelineText}>{segment.text}</p>
                    {Array.isArray(segment.words) && segment.words.length > 0 && (
                      <ul className={styles.wordList}>
                        {segment.words.map((word, wordIndex) => (
                          <li key={`${word.text}-${wordIndex}`}>
                            <span className={styles.wordText}>{word.text}</span>
                            <span className={styles.wordTime}>
                              {word.start}s – {word.end}s
                            </span>
                            {typeof word.confidence === 'number' && (
                              <span className={styles.wordConfidence}>
                                {(word.confidence * 100).toFixed(0)}%
                              </span>
                            )}
                            {word.speaker && <span className={styles.wordSpeaker}>{word.speaker}</span>}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default AiKaraokePage;
