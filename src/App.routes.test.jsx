import '../test/setup.js';
import assert from 'node:assert/strict';
import test, { afterEach } from 'node:test';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { cleanup, render, screen } from '@testing-library/react';
import App from './App.jsx';

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

test('неавторизованный пользователь перенаправляется на страницу входа для приватного корня', async () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>,
  );

  const heading = await screen.findByRole('heading', { name: 'AIK 2' });
  assert.ok(heading);

  const loginLink = await screen.findByRole('link', { name: 'Вход' });
  assert.equal(loginLink.getAttribute('aria-current'), 'page');
});

test('маршрут караоке остаётся публичным без токена', async () => {
  render(
    <MemoryRouter initialEntries={['/karaoke']}>
      <App />
    </MemoryRouter>,
  );

  const karaokeHeading = await screen.findByRole('heading', { name: 'Караоке-сцена' });
  assert.ok(karaokeHeading);

  const karaokeLink = await screen.findByRole('link', { name: 'Караоке' });
  assert.equal(karaokeLink.getAttribute('aria-current'), 'page');
});

test('другие маршруты без токена остаются приватными и отправляют на aik2', async () => {
  render(
    <MemoryRouter initialEntries={['/profile']}>
      <App />
    </MemoryRouter>,
  );

  const heading = await screen.findByRole('heading', { name: 'AIK 2' });
  assert.ok(heading);

  const loginLink = await screen.findByRole('link', { name: 'Вход' });
  assert.equal(loginLink.getAttribute('aria-current'), 'page');
});

test('при наличии токена приватный маршрут перенаправляет к караоке', async () => {
  window.localStorage.setItem('token', 'valid-token');

  render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>,
  );

  const heading = await screen.findByRole('heading', { name: 'Караоке-сцена' });
  assert.ok(heading);

  const karaokeLink = await screen.findByRole('link', { name: 'Караоке' });
  assert.equal(karaokeLink.getAttribute('aria-current'), 'page');
});

test('маршрут aik2 остаётся публичным и подсвечивает ссылку входа', async () => {
  render(
    <MemoryRouter initialEntries={['/aik2']}>
      <App />
    </MemoryRouter>,
  );

  const heading = await screen.findByRole('heading', { name: 'AIK 2' });
  assert.ok(heading);

  const description = await screen.findByText(
    'Страница в разработке. Скоро появится больше возможностей.',
  );
  assert.ok(description);

  const loginLink = await screen.findByRole('link', { name: 'Вход' });
  assert.equal(loginLink.getAttribute('aria-current'), 'page');
});
