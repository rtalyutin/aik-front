import '../../../test/setup.js';
import assert from 'node:assert/strict';
import test, { afterEach, beforeEach } from 'node:test';
import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import authConfig from './config.json';
import AuthPage from './AuthPage.jsx';

let originalAssign;
let assignCalls;

beforeEach(() => {
  originalAssign = window.location.assign;
  assignCalls = [];

  window.location.assign = (url) => {
    assignCalls.push(String(url));
  };
});

afterEach(() => {
  cleanup();
  window.location.assign = originalAssign;
});

test('страница авторизации отображает провайдеров из конфигурации', async () => {
  render(<AuthPage />);

  const title = await screen.findByRole('heading', { name: authConfig.title });
  assert.ok(title, 'должен отображаться заголовок из конфигурации');

  const vkButton = await screen.findByRole('button', {
    name: `Войти через ${authConfig.providers[0].name}`,
  });
  const yaButton = screen.getByRole('button', {
    name: `Войти через ${authConfig.providers[1].name}`,
  });

  assert.ok(vkButton, 'должна отображаться кнопка VK ID');
  assert.ok(yaButton, 'должна отображаться кнопка Yandex ID');
});

test('клик по провайдеру инициирует редирект на authorizeUrl', async () => {
  render(<AuthPage />);

  const vkButton = await screen.findByRole('button', {
    name: `Войти через ${authConfig.providers[0].name}`,
  });

  fireEvent.click(vkButton);

  assert.deepEqual(assignCalls, [authConfig.providers[0].authorizeUrl]);
});
