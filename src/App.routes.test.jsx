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

test('любые маршруты отображают страницу караоке', async () => {
  render(
    <MemoryRouter initialEntries={['/karaoke']}>
      <App />
    </MemoryRouter>,
  );

  const heading = await screen.findByRole('heading', { name: 'Караоке-сцена' });
  assert.ok(heading);

  cleanup();

  render(
    <MemoryRouter initialEntries={['/unknown']}>
      <App />
    </MemoryRouter>,
  );

  const fallbackHeading = await screen.findByRole('heading', { name: 'Караоке-сцена' });
  assert.ok(fallbackHeading);
});
