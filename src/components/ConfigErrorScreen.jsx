import React from 'react';

const ConfigErrorScreen = ({ missingKeys = [], details = [] }) => {
  const uniqueDetails = Array.from(new Set(details.filter(Boolean)));

  return (
    <div className="config-error">
      <div className="config-error__card">
        <h1>Неверная конфигурация окружения</h1>
        <p>
          Для запуска приложения задайте обязательные переменные окружения с префиксом <code>VITE_</code>:
        </p>
        <ul>
          {missingKeys.map((key) => (
            <li key={key}>
              <code>{key}</code>
            </li>
          ))}
        </ul>
        {uniqueDetails.length > 0 ? (
          <div className="config-error__details">
            <p>Детали проверки:</p>
            <ul>
              {uniqueDetails.map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
          </div>
        ) : null}
        <p>
          Обновите конфигурацию деплоя (например, переменные окружения в CI/CD или файлы <code>.env</code>) и перезапустите сборку.
        </p>
      </div>
    </div>
  );
};

export default ConfigErrorScreen;
