import '../test/setup.js';
import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import App from './App.jsx';

test('переключение темы обновляет дата-атрибут документа', async () => {
  document.documentElement.dataset.theme = '';

  render(<App />);
  await screen.findByTestId('app-shell');

  assert.equal(document.documentElement.dataset.theme, 'light');

  const toggle = screen.getByRole('button', { name: 'Переключить тему' });
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

  render(<App />);
  const appShell = await screen.findByTestId('app-shell');
  const foxDreamButton = screen.getByRole('button', { name: 'Лисий сон' });
  const blueButton = screen.getByRole('button', { name: 'Синий' });

  assert.equal(appShell.dataset.accent, 'fox-dream');
  assert.equal(document.documentElement.dataset.accent, 'fox-dream');
  assert.equal(foxDreamButton.getAttribute('aria-pressed'), 'true');
  assert.equal(blueButton.getAttribute('aria-pressed'), 'false');

  fireEvent.click(blueButton);

  assert.equal(appShell.dataset.accent, 'blue');
  assert.equal(document.documentElement.dataset.accent, 'blue');
  assert.equal(blueButton.getAttribute('aria-pressed'), 'true');
  assert.equal(foxDreamButton.getAttribute('aria-pressed'), 'false');

  fireEvent.click(foxDreamButton);

  assert.equal(appShell.dataset.accent, 'fox-dream');
  assert.equal(document.documentElement.dataset.accent, 'fox-dream');
  assert.equal(foxDreamButton.getAttribute('aria-pressed'), 'true');
  assert.equal(blueButton.getAttribute('aria-pressed'), 'false');
});
