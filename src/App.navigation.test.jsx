import '../test/setup.js';
import assert from 'node:assert/strict';
import test, { afterEach } from 'node:test';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { cleanup, fireEvent, render } from '@testing-library/react';
import App from './App.jsx';

afterEach(() => {
  cleanup();
});

test('навигация переключает маршрут и активное состояние ссылок', async () => {
  const { findByRole, getByRole } = render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>,
  );

  const processingLink = await findByRole('link', { name: 'Обработка' });
  const karaokeLink = getByRole('link', { name: 'Караоке' });

  assert.ok(processingLink.className.includes('app-header__nav-link--active'));
  assert.ok(!karaokeLink.className.includes('app-header__nav-link--active'));

  fireEvent.click(karaokeLink);

  await findByRole('heading', { name: 'Караоке-сцена' });

  assert.ok(!processingLink.className.includes('app-header__nav-link--active'));
  assert.ok(karaokeLink.className.includes('app-header__nav-link--active'));
});

test('активное состояние корректно отображается при прямом переходе', async () => {
  const { findByRole, getByRole } = render(
    <MemoryRouter initialEntries={['/karaoke']}>
      <App />
    </MemoryRouter>,
  );

  const karaokeLink = await findByRole('link', { name: 'Караоке' });
  const processingLink = getByRole('link', { name: 'Обработка' });

  await findByRole('heading', { name: 'Караоке-сцена' });

  assert.ok(karaokeLink.className.includes('app-header__nav-link--active'));
  assert.ok(!processingLink.className.includes('app-header__nav-link--active'));
});
