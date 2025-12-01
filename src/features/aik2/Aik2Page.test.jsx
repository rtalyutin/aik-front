import '../../../test/setup.js';
import assert from 'node:assert/strict';
import test, { afterEach } from 'node:test';
import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import config from './config.js';
import Aik2Page from './Aik2Page.jsx';

afterEach(() => {
  cleanup();
});

test('renders login form with labels and placeholders from config', () => {
  render(<Aik2Page />);

  assert.ok(screen.getByRole('heading', { level: 1, name: config.title }));
  assert.ok(screen.getByRole('heading', { level: 2, name: config.form.heading }));
  assert.ok(screen.getByText(config.description));

  const loginInput = screen.getByLabelText(config.form.loginLabel);
  const passwordInput = screen.getByLabelText(config.form.passwordLabel);

  assert.equal(loginInput.getAttribute('placeholder'), config.form.loginPlaceholder);
  assert.equal(passwordInput.getAttribute('placeholder'), config.form.passwordPlaceholder);
});

test('shows validation errors and status when fields are empty on submit', () => {
  render(<Aik2Page />);

  fireEvent.click(screen.getByRole('button', { name: config.form.submitLabel }));

  assert.ok(screen.getByText(config.form.validationMessages.loginRequired));
  assert.ok(screen.getByText(config.form.validationMessages.passwordRequired));
  assert.ok(screen.getByText(config.form.validationMessages.requiredFields));
});

test('submits form and shows success message when fields are filled', () => {
  render(<Aik2Page />);

  fireEvent.change(screen.getByLabelText(config.form.loginLabel), {
    target: { value: 'demo-user' },
  });
  fireEvent.change(screen.getByLabelText(config.form.passwordLabel), {
    target: { value: 'demo-pass' },
  });

  fireEvent.click(screen.getByRole('button', { name: config.form.submitLabel }));

  assert.ok(screen.getByText(config.form.successMessage));
  assert.equal(screen.queryByText(config.form.validationMessages.loginRequired), null);
  assert.equal(screen.queryByText(config.form.validationMessages.passwordRequired), null);
});
