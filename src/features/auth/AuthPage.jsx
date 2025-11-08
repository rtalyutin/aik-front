import React from 'react';
import Button from '../../components/Button.jsx';
import authConfig from './config.json';

const ensureProviders = (rawProviders) => {
  if (!Array.isArray(rawProviders)) {
    return [];
  }

  return rawProviders
    .filter((provider) => provider && typeof provider === 'object')
    .map((provider, index) => ({
      id: provider.id || provider.name || provider.authorizeUrl || `provider-${index}`,
      name: provider.name || 'Провайдер',
      description: provider.description || '',
      authorizeUrl: provider.authorizeUrl || '',
      icon: provider.icon || '',
    }));
};

const AuthPage = () => {
  const title = authConfig?.title || 'Авторизация';
  const subtitle = authConfig?.subtitle || '';

  const providers = ensureProviders(authConfig?.providers);

  const handleAuthorize = (authorizeUrl) => {
    if (!authorizeUrl || typeof authorizeUrl !== 'string') {
      return;
    }

    const targetUrl = authorizeUrl.trim();

    if (!targetUrl) {
      return;
    }

    if (typeof window === 'undefined' || !window?.location) {
      return;
    }

    const assign = window.location.assign;

    if (typeof assign === 'function') {
      assign.call(window.location, targetUrl);
    }
  };

  return (
    <div className="auth-page">
      <header className="auth-page__header">
        <h1 className="auth-page__title">{title}</h1>
        {subtitle ? <p className="auth-page__subtitle">{subtitle}</p> : null}
      </header>
      <section className="auth-page__providers" aria-label="Провайдеры авторизации">
        {providers.length > 0 ? (
          <ul className="auth-page__provider-list">
            {providers.map((provider) => {
              const buttonLabel = `Войти через ${provider.name}`;

              return (
                <li key={provider.id} className="auth-page__provider-item">
                  <article className="auth-page__provider-card">
                    <div className="auth-page__provider-header">
                      {provider.icon ? (
                        <span className="auth-page__provider-icon" aria-hidden="true">
                          {provider.icon}
                        </span>
                      ) : null}
                      <h2 className="auth-page__provider-name">{provider.name}</h2>
                    </div>
                    {provider.description ? (
                      <p className="auth-page__provider-description">
                        {provider.description}
                      </p>
                    ) : null}
                    <Button
                      type="button"
                      variant="primary"
                      className="auth-page__provider-action"
                      onClick={() => handleAuthorize(provider.authorizeUrl)}
                      disabled={!provider.authorizeUrl}
                    >
                      {buttonLabel}
                    </Button>
                  </article>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="auth-page__empty">Провайдеры авторизации временно недоступны.</p>
        )}
      </section>
    </div>
  );
};

export default AuthPage;
