import '../test/setup.js';
import assert from 'node:assert/strict';
import test, { afterEach } from 'node:test';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { cleanup, render, screen } from '@testing-library/react';
import App from './App.jsx';

afterEach(() => {
  cleanup();
});

test('корневой маршрут перенаправляет на страницу караоке', async () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>,
  );

  const heading = await screen.findByRole('heading', { name: 'Караоке-сцена' });
  assert.ok(heading);
});

test('маршрут караоке доступен и активен в меню', async () => {
  render(
    <MemoryRouter initialEntries={['/karaoke']}>
      <App />
    </MemoryRouter>,
  );

  const heading = await screen.findByRole('heading', { name: 'Караоке-сцена' });
  assert.ok(heading);

  const karaokeLink = await screen.findByRole('link', { name: 'Караоке' });
  assert.equal(karaokeLink.getAttribute('aria-current'), 'page');

  cleanup();

  render(
    <MemoryRouter initialEntries={['/unknown']}>
      <App />
    </MemoryRouter>,
  );

  const fallbackHeading = await screen.findByRole('heading', { name: 'Караоке-сцена' });
  assert.ok(fallbackHeading);
});

test('маршрут aik2 отображает заглушку и подсвечивает ссылку входа', async () => {
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
