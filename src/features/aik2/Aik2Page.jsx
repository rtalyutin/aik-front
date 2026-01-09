import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import apiEndpoints from '../../config/apiEndpoints.js';
import config from './config.js';
import styles from './Aik2Page.module.css';
import { LocalAuthButton } from '../../../no-internet-scripts/index.js';

const Aik2Page = () => {
  const [formData, setFormData] = useState({ login: '', password: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  const validationMessages = useMemo(() => {
    const messages = config.form?.validationMessages ?? {};

    return {
      loginRequired: messages.loginRequired || 'Укажите логин.',
      passwordRequired: messages.passwordRequired || 'Укажите пароль.',
      requiredFields:
        messages.requiredFields || 'Заполните обязательные поля для отправки формы.',
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
      setStatus((prev) => (prev.type === 'error' ? { type: 'idle', message: '' } : prev));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.login.trim()) {
      newErrors.login = validationMessages.loginRequired;
    }

    if (!formData.password.trim()) {
      newErrors.password = validationMessages.passwordRequired;
    }

    return newErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setStatus({ type: 'error', message: validationMessages.requiredFields });
      return;
    }

    try {
      setStatus({ type: 'idle', message: '' });

      const response = await fetch(apiEndpoints.authSignIn, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ login: formData.login, password: formData.password }),
      });

      const contentType = response.headers?.get?.('content-type') ?? '';
      const isJson = contentType.includes('application/json');
      const responseBody = isJson ? await response.json() : await response.text();

      if (!response.ok) {
        const errorMessage =
          (isJson && (responseBody?.message || responseBody?.error)) ||
          (typeof responseBody === 'string' ? responseBody : '') ||
          `Ошибка ${response.status}`;

        throw new Error(errorMessage);
      }

      const token =
        typeof responseBody === 'object' && responseBody !== null
          ? responseBody?.token ?? responseBody?.data?.token
          : undefined;

      if (!token) {
        console.warn?.('Unexpected auth response shape during login', responseBody);
        throw new Error('Не удалось получить токен. Попробуйте ещё раз.');
      }

      login(token);

      setErrors({});
      setStatus({ type: 'success', message: config.form?.successMessage || 'Форма отправлена.' });
      navigate('/karaoke', { replace: true });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error?.message || 'Не удалось выполнить вход. Попробуйте ещё раз.',
      });
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/karaoke', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <section className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>{config.title}</h1>
        <p className={styles.description}>{config.description}</p>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <h2 className={styles.formHeading}>{config.form?.heading}</h2>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="login">
              {config.form?.loginLabel}
            </label>
            <input
              id="login"
              name="login"
              type="text"
              value={formData.login}
              onChange={handleChange}
              placeholder={config.form?.loginPlaceholder}
              className={styles.input}
              aria-invalid={Boolean(errors.login)}
              aria-describedby={errors.login ? 'login-error' : undefined}
              autoComplete="username"
            />
            {errors.login && (
              <p className={styles.errorMessage} id="login-error" role="alert">
                {errors.login}
              </p>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">
              {config.form?.passwordLabel}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={config.form?.passwordPlaceholder}
              className={styles.input}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'password-error' : undefined}
              autoComplete="current-password"
            />
            {errors.password && (
              <p className={styles.errorMessage} id="password-error" role="alert">
                {errors.password}
              </p>
            )}
          </div>

          <div className={styles.actions}>
            <button className={styles.button} type="submit">
              {config.form?.submitLabel}
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
            <LocalAuthButton buttonClassName={styles.button} />
          </div>

          {status.message && (
            <p
              className={
                status.type === 'error'
                  ? styles.errorMessage
                  : `${styles.statusMessage} ${styles.successMessage}`
              }
              role="status"
              aria-live="polite"
            >
              {status.message}
            </p>
          )}
        </form>
      </div>
    </section>
  );
};

export default Aik2Page;
