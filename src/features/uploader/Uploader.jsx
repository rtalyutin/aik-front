import React, { useEffect, useMemo, useState } from 'react';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Tag from '../../components/Tag';
import config from './config.json';

const { constraints = {}, api = {} } = config;

const Uploader = ({ onCreateJob, isCreating = false, onCancel, initialUrl = '' }) => {
  const [inputValue, setInputValue] = useState(initialUrl ?? '');
  const [validationError, setValidationError] = useState('');
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    setInputValue(initialUrl ?? '');
  }, [initialUrl]);

  const allowedProtocols = useMemo(() => {
    const protocols = new Set(constraints.allowedProtocols ?? ['http:', 'https:']);
    return protocols;
  }, []);

  const maxUrlLength = constraints.maxUrlLength ?? 0;

  const validateUrl = (value) => {
    const trimmed = value.trim();

    if (!trimmed) {
      return 'Укажите ссылку на файл или поток.';
    }

    let parsed;
    try {
      parsed = new URL(trimmed);
    } catch (error) {
      return 'Введите корректную ссылку в формате http(s).';
    }

    if (allowedProtocols.size > 0 && !allowedProtocols.has(parsed.protocol)) {
      return 'Допустимы только ссылки с протоколами HTTP или HTTPS.';
    }

    if (maxUrlLength > 0 && trimmed.length > maxUrlLength) {
      return 'Ссылка превышает допустимую длину. Попробуйте укоротить её.';
    }

    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const errorMessage = validateUrl(inputValue);

    if (errorMessage) {
      setValidationError(errorMessage);
      setSubmitError('');
      return;
    }

    setValidationError('');
    setSubmitError('');

    try {
      await onCreateJob?.(inputValue.trim());
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось создать задачу.';
      setSubmitError(message);
    }
  };

  return (
    <Card className="uploader" aria-labelledby="uploader-title">
      <div className="uploader__header">
        <div>
          <h2 id="uploader-title" className="uploader__title">
            {config.title}
          </h2>
          <p className="uploader__description">{config.description}</p>
        </div>
        {api.createJobEndpoint && (
          <Tag className="uploader__endpoint" aria-label="Адрес точки создания задачи">
            POST {api.createJobEndpoint}
          </Tag>
        )}
      </div>
      <form className="uploader__form" onSubmit={handleSubmit} noValidate>
        <label className="uploader__label" htmlFor="uploader-url">
          Ссылка на аудио или видео
        </label>
        <input
          id="uploader-url"
          className="uploader__input"
          type="url"
          name="sourceUrl"
          placeholder="https://example.com/track.mp3"
          autoComplete="off"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          disabled={isCreating}
          aria-invalid={Boolean(validationError || submitError)}
          aria-describedby="uploader-help uploader-errors"
        />
        <p id="uploader-help" className="uploader__help">
          Допустимые протоколы:{' '}
          {Array.from(allowedProtocols)
            .map((protocol) => protocol.replace(':', '').toUpperCase())
            .join(', ')}
          .
        </p>
        {(validationError || submitError) && (
          <p id="uploader-errors" className="uploader__error" role="alert">
            {validationError || submitError}
          </p>
        )}
        <div className="uploader__actions">
          <Button type="submit" disabled={isCreating}>
            {isCreating ? 'Создание…' : 'Создать задачу'}
          </Button>
          {onCancel && (
            <Button type="button" variant="ghost" onClick={onCancel} disabled={isCreating}>
              Отменить
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
};

export default Uploader;
