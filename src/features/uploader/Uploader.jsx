import React, { useEffect, useMemo, useState } from 'react';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Tag from '../../components/Tag';
import config from './config.json';

const { constraints = {}, api = {} } = config;

const Uploader = ({
  onCreateJob,
  onCreateFileJob,
  isCreating = false,
  onCancel,
  initialUrl = '',
  fileEndpoint,
  fileConstraints = {},
}) => {
  const [mode, setMode] = useState(onCreateFileJob ? 'url' : 'url');
  const [inputValue, setInputValue] = useState(initialUrl ?? '');
  const [selectedFile, setSelectedFile] = useState(null);
  const [validationError, setValidationError] = useState('');
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    setInputValue(initialUrl ?? '');
  }, [initialUrl]);

  const supportsFileUpload = Boolean(onCreateFileJob && (fileEndpoint || api.createFileJobEndpoint));
  const effectiveFileEndpoint = fileEndpoint ?? api.createFileJobEndpoint ?? '';

  const currentEndpoint =
    mode === 'file' && supportsFileUpload ? effectiveFileEndpoint : api.createJobEndpoint;

  const allowedProtocols = useMemo(() => {
    const protocols = new Set(constraints.allowedProtocols ?? ['http:', 'https:']);
    return protocols;
  }, []);

  const maxUrlLength = constraints.maxUrlLength ?? 0;

  const acceptAttribute = useMemo(() => {
    if (!supportsFileUpload) {
      return undefined;
    }

    const accept = fileConstraints?.accept;

    if (Array.isArray(accept)) {
      return accept.join(',');
    }

    if (typeof accept === 'string') {
      return accept;
    }

    return undefined;
  }, [fileConstraints, supportsFileUpload]);

  const maxFileSizeBytes = useMemo(() => {
    const limit = Number(fileConstraints?.maxSizeMb);

    if (!Number.isFinite(limit) || limit <= 0) {
      return 0;
    }

    return limit * 1024 * 1024;
  }, [fileConstraints]);

  const fileHelpText = useMemo(() => {
    if (!supportsFileUpload) {
      return '';
    }

    const parts = [];

    if (acceptAttribute) {
      parts.push(`Допустимые форматы: ${acceptAttribute}.`);
    }

    if (fileConstraints?.maxSizeMb) {
      parts.push(`Максимальный размер: ${fileConstraints.maxSizeMb} МБ.`);
    }

    return parts.join(' ');
  }, [acceptAttribute, fileConstraints, supportsFileUpload]);

  useEffect(() => {
    setValidationError('');
    setSubmitError('');

    if (mode === 'url') {
      setSelectedFile(null);
    }
  }, [mode]);

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

  const validateFile = (file) => {
    if (!file) {
      return 'Выберите файл для загрузки.';
    }

    if (maxFileSizeBytes > 0 && file.size > maxFileSizeBytes) {
      const limitLabel = fileConstraints?.maxSizeMb ? `${fileConstraints.maxSizeMb} МБ` : '';
      return limitLabel
        ? `Файл превышает допустимый размер ${limitLabel}.`
        : 'Файл превышает допустимый размер.';
    }

    const accept = fileConstraints?.accept;

    if (Array.isArray(accept) && accept.length > 0 && file.type) {
      const matches = accept.some((pattern) => {
        if (!pattern) {
          return false;
        }

        if (pattern.endsWith('/*')) {
          const prefix = pattern.slice(0, -2);
          return file.type.startsWith(`${prefix}/`);
        }

        return file.type === pattern;
      });

      if (!matches) {
        return 'Тип файла не поддерживается.';
      }
    } else if (typeof accept === 'string' && accept.trim() && file.type) {
      const patterns = accept
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

      if (
        patterns.length > 0 &&
        !patterns.some((pattern) => {
          if (pattern.endsWith('/*')) {
            const prefix = pattern.slice(0, -2);
            return file.type.startsWith(`${prefix}/`);
          }

          return file.type === pattern;
        })
      ) {
        return 'Тип файла не поддерживается.';
      }
    }

    return '';
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setValidationError('');
    setSubmitError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (mode === 'file') {
      if (!supportsFileUpload) {
        setSubmitError('Загрузка файлов недоступна в текущей конфигурации.');
        return;
      }

      const fileError = validateFile(selectedFile);

      if (fileError) {
        setValidationError(fileError);
        setSubmitError('');
        return;
      }

      setValidationError('');
      setSubmitError('');

      try {
        await onCreateFileJob?.(selectedFile);
        setSelectedFile(null);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Не удалось создать задачу из файла.';
        setSubmitError(message);
      }

      return;
    }

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
        {currentEndpoint && (
          <Tag className="uploader__endpoint" aria-label="Адрес точки создания задачи">
            POST {currentEndpoint}
          </Tag>
        )}
      </div>
      {supportsFileUpload && (
        <div className="uploader__mode-switch" role="toolbar" aria-label="Способ создания задачи">
          <Button
            type="button"
            variant={mode === 'url' ? 'primary' : 'ghost'}
            onClick={() => setMode('url')}
            aria-pressed={mode === 'url'}
            disabled={isCreating}
          >
            По ссылке
          </Button>
          <Button
            type="button"
            variant={mode === 'file' ? 'primary' : 'ghost'}
            onClick={() => setMode('file')}
            aria-pressed={mode === 'file'}
            disabled={isCreating}
          >
            Из файла
          </Button>
        </div>
      )}
      <form className="uploader__form" onSubmit={handleSubmit} noValidate>
        <label className="uploader__label" htmlFor={mode === 'file' ? 'uploader-file' : 'uploader-url'}>
          {mode === 'file' ? 'Выберите аудио или видео файл' : 'Ссылка на аудио или видео'}
        </label>
        {mode === 'file' ? (
          <>
            <input
              id="uploader-file"
              key="uploader-file-input"
              className="uploader__input uploader__input--file"
              type="file"
              name="sourceFile"
              accept={acceptAttribute}
              onChange={handleFileChange}
              disabled={isCreating}
              aria-invalid={Boolean(validationError || submitError)}
              aria-describedby="uploader-help uploader-errors"
            />
            {selectedFile && (
              <p className="uploader__file-name" aria-live="polite">
                Выбран файл: {selectedFile.name}
              </p>
            )}
            <p id="uploader-help" className="uploader__help">
              {fileHelpText || 'Выберите файл подходящего формата.'}
            </p>
          </>
        ) : (
          <>
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
          </>
        )}
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
