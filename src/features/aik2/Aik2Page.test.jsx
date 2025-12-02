import '../../../test/setup.js';
import assert from 'node:assert/strict';
import test, { afterEach } from 'node:test';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AuthProvider } from '../../context/AuthContext.jsx';
import config from './config.js';
import Aik2Page from './Aik2Page.jsx';

const originalFetch = globalThis.fetch;

const renderWithRouter = (ui) =>
  render(
    <MemoryRouter>
      <AuthProvider>{ui}</AuthProvider>
    </MemoryRouter>,
  );

afterEach(() => {
  cleanup();
  globalThis.fetch = originalFetch;
  window.localStorage.clear();
});

test('renders login form with labels and placeholders from config', () => {
  renderWithRouter(<Aik2Page />);

  assert.ok(screen.getByRole('heading', { level: 1, name: config.title }));
  assert.ok(screen.getByRole('heading', { level: 2, name: config.form.heading }));
  assert.ok(screen.getByText(config.description));

  const loginInput = screen.getByLabelText(config.form.loginLabel);
  const passwordInput = screen.getByLabelText(config.form.passwordLabel);

  assert.equal(loginInput.getAttribute('placeholder'), config.form.loginPlaceholder);
  assert.equal(passwordInput.getAttribute('placeholder'), config.form.passwordPlaceholder);
});

test('shows validation errors and status when fields are empty on submit', () => {
  renderWithRouter(<Aik2Page />);

  fireEvent.click(screen.getByRole('button', { name: config.form.submitLabel }));

  assert.ok(screen.getByText(config.form.validationMessages.loginRequired));
  assert.ok(screen.getByText(config.form.validationMessages.passwordRequired));
  assert.ok(screen.getByText(config.form.validationMessages.requiredFields));
});

test('submits form, stores token, and shows success message when fields are valid', async () => {
  const token = 'demo-token';

  globalThis.fetch = () =>
    Promise.resolve({
      ok: true,
      status: 200,
      headers: {
        get(name) {
          return name.toLowerCase() === 'content-type' ? 'application/json' : null;
        },
      },
      json: async () => ({ token }),
    });

  renderWithRouter(<Aik2Page />);

  fireEvent.change(screen.getByLabelText(config.form.loginLabel), {
    target: { value: 'demo-user' },
  });
  fireEvent.change(screen.getByLabelText(config.form.passwordLabel), {
    target: { value: 'demo-pass' },
  });

  fireEvent.click(screen.getByRole('button', { name: config.form.submitLabel }));

  await waitFor(() => {
    assert.ok(screen.getByText(config.form.successMessage));
  });

  assert.equal(window.localStorage.getItem('token'), token);
  assert.equal(screen.queryByText(config.form.validationMessages.loginRequired), null);
  assert.equal(screen.queryByText(config.form.validationMessages.passwordRequired), null);
});

test('submits form and accepts nested token under data.token', async () => {
  const token = 'nested-token';

  globalThis.fetch = () =>
    Promise.resolve({
      ok: true,
      status: 200,
      headers: {
        get(name) {
          return name.toLowerCase() === 'content-type' ? 'application/json' : null;
        },
      },
      json: async () => ({ data: { token } }),
    });

  renderWithRouter(<Aik2Page />);

  fireEvent.change(screen.getByLabelText(config.form.loginLabel), {
    target: { value: 'demo-user' },
  });
  fireEvent.change(screen.getByLabelText(config.form.passwordLabel), {
    target: { value: 'demo-pass' },
  });

  fireEvent.click(screen.getByRole('button', { name: config.form.submitLabel }));

  await waitFor(() => {
    assert.ok(screen.getByText(config.form.successMessage));
  });

  assert.equal(window.localStorage.getItem('token'), token);
});

test('shows generic error and logs warning when token is missing', async () => {
  const warnCalls = [];
  const originalWarn = console.warn;
  console.warn = (...args) => warnCalls.push(args);

  globalThis.fetch = () =>
    Promise.resolve({
      ok: true,
      status: 200,
      headers: {
        get(name) {
          return name.toLowerCase() === 'content-type' ? 'application/json' : null;
        },
      },
      json: async () => ({ data: {} }),
    });

  try {
    renderWithRouter(<Aik2Page />);

    fireEvent.change(screen.getByLabelText(config.form.loginLabel), {
      target: { value: 'demo-user' },
    });
    fireEvent.change(screen.getByLabelText(config.form.passwordLabel), {
      target: { value: 'demo-pass' },
    });

    fireEvent.click(screen.getByRole('button', { name: config.form.submitLabel }));

    await waitFor(() => {
      assert.ok(
        screen.getByText('Не удалось получить токен. Попробуйте ещё раз.'),
      );
    });

    assert.equal(window.localStorage.getItem('token'), null);
    assert.ok(
      warnCalls.some(([message]) =>
        typeof message === 'string' && message.includes('Unexpected auth response shape'),
      ),
    );
  } finally {
    console.warn = originalWarn;
  }
});

test('shows error message when API returns an error status', async () => {
  const errorMessage = 'Неверные учетные данные';

  globalThis.fetch = () =>
    Promise.resolve({
      ok: false,
      status: 401,
      headers: {
        get(name) {
          return name.toLowerCase() === 'content-type' ? 'application/json' : null;
        },
      },
      json: async () => ({ message: errorMessage }),
    });

  renderWithRouter(<Aik2Page />);

  fireEvent.change(screen.getByLabelText(config.form.loginLabel), {
    target: { value: 'demo-user' },
  });
  fireEvent.change(screen.getByLabelText(config.form.passwordLabel), {
    target: { value: 'demo-pass' },
  });

  fireEvent.click(screen.getByRole('button', { name: config.form.submitLabel }));

  await waitFor(() => {
    assert.ok(screen.getByText(errorMessage));
  });

  assert.equal(window.localStorage.getItem('token'), null);
});
