import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App.jsx';
import AuthContext from './context/AuthContext.jsx';

const renderApp = ({ isAuthenticated = false, initialEntries = ['/ai-karaoke'] } = {}) => {
  render(
    <AuthContext.Provider value={{ isAuthenticated, login: () => {}, logout: () => {} }}>
      <MemoryRouter initialEntries={initialEntries}>
        <App />
      </MemoryRouter>
    </AuthContext.Provider>,
  );
};

test('redirects guests from AI karaoke to sign-in', async () => {
  renderApp({ isAuthenticated: false });

  await waitFor(() => {
    assert.ok(screen.getByRole('heading', { name: 'AIK 2' }));
  });
});

test('allows authenticated users to open AI karaoke page', () => {
  renderApp({ isAuthenticated: true });

  assert.ok(screen.getByRole('heading', { name: 'ИИ-Караоке' }));
  assert.ok(screen.getByText('Страница в разработке'));
});
