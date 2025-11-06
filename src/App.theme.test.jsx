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

test('переключение темы обновляет дата-атрибут документа', async () => {
  document.documentElement.dataset.theme = '';

  const { findByTestId, getByRole } = render(
    <MemoryRouter>
      <App />
    </MemoryRouter>,
  );
  await findByTestId('app-shell');

  assert.equal(document.documentElement.dataset.theme, 'light');

  const toggle = getByRole('button', { name: /Переключить тему/ });
  fireEvent.click(toggle);
  assert.equal(document.documentElement.dataset.theme, 'dark');

  fireEvent.click(toggle);
  assert.equal(document.documentElement.dataset.theme, 'light');
});

test('переключение цветового акцента меняет дата-атрибуты и состояния кнопок', async () => {
  document.documentElement.dataset.accent = '';
  const rootNode = document.getElementById('root');

  if (rootNode) {
    rootNode.dataset.accent = '';
  }

  const { findByTestId, getByRole } = render(
    <MemoryRouter>
      <App />
    </MemoryRouter>,
  );
  const appShell = await findByTestId('app-shell');
  const accentButtons = {
    'fox-dream': getByRole('button', { name: 'Лисий сон' }),
    blue: getByRole('button', { name: 'Синий' }),
    'aurora-pulse': getByRole('button', { name: 'Пульс Авроры' }),
  };

  const assertAccentState = (expectedAccent) => {
    assert.equal(appShell.dataset.accent, expectedAccent);
    assert.equal(document.documentElement.dataset.accent, expectedAccent);

    Object.entries(accentButtons).forEach(([preset, button]) => {
      const expectedPressed = preset === expectedAccent ? 'true' : 'false';
      assert.equal(button.getAttribute('aria-pressed'), expectedPressed);
    });
  };

  assertAccentState('fox-dream');

  fireEvent.click(accentButtons.blue);
  assertAccentState('blue');

  fireEvent.click(accentButtons['aurora-pulse']);
  assertAccentState('aurora-pulse');

  fireEvent.click(accentButtons['fox-dream']);
  assertAccentState('fox-dream');
});
