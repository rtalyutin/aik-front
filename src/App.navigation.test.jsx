import '../test/setup.js';
import assert from 'node:assert/strict';
import test, { afterEach } from 'node:test';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import App from './App.jsx';

afterEach(() => {
  cleanup();
});

test('навигация отображает два пункта меню и переключает активное состояние', async () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>,
  );

  const navigation = screen.getByRole('navigation', { name: 'Основная навигация' });
  assert.ok(navigation, 'элемент навигации должен иметь aria-label "Основная навигация"');

  const processingLink = await screen.findByRole('link', { name: 'Обработка' });
  const karaokeLink = screen.getByRole('link', { name: 'Караоке' });
  const authLink = screen.queryByRole('link', { name: 'Авторизация' });
  assert.equal(authLink, null, 'пункт "Авторизация" не должен отображаться в навигации');

  assert.equal(processingLink.getAttribute('aria-current'), 'page');
  assert.ok(processingLink.className.includes('app-header__nav-link--active'));
  assert.ok(!karaokeLink.className.includes('app-header__nav-link--active'));

  fireEvent.click(karaokeLink);
  await screen.findByRole('heading', { name: 'Караоке-сцена' });

  const processingAfterKaraoke = screen.getByRole('link', { name: 'Обработка' });
  const karaokeAfterClick = screen.getByRole('link', { name: 'Караоке' });

  assert.equal(karaokeAfterClick.getAttribute('aria-current'), 'page');
  assert.ok(karaokeAfterClick.className.includes('app-header__nav-link--active'));
  assert.ok(!processingAfterKaraoke.className.includes('app-header__nav-link--active'));
});

test('страница авторизации доступна по прямому маршруту без пункта меню', async () => {
  render(
    <MemoryRouter initialEntries={['/auth']}>
      <App />
    </MemoryRouter>,
  );

  const navigation = screen.getByRole('navigation', { name: 'Основная навигация' });
  assert.ok(navigation, 'навигация должна быть доступна по aria-label');

  const processingLink = screen.getByRole('link', { name: 'Обработка' });
  const karaokeLink = screen.getByRole('link', { name: 'Караоке' });
  const authLink = screen.queryByRole('link', { name: 'Авторизация' });

  await screen.findByRole('heading', { name: 'Авторизация Cherry RAiT' });

  assert.equal(authLink, null, 'страница авторизации не должна отображаться в меню даже при переходе по маршруту');
  assert.ok(!processingLink.className.includes('app-header__nav-link--active'));
  assert.ok(!karaokeLink.className.includes('app-header__nav-link--active'));
});
