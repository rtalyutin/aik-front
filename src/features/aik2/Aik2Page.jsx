import React, { useMemo, useState } from 'react';
import config from './config.js';
import styles from './Aik2Page.module.css';

const Aik2Page = () => {
  const [formData, setFormData] = useState({ login: '', password: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: 'idle', message: '' });

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

  const handleSubmit = (event) => {
    event.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setStatus({ type: 'error', message: validationMessages.requiredFields });
      return;
    }

    setErrors({});
    setStatus({ type: 'success', message: config.form?.successMessage || 'Форма отправлена.' });
  };

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
