import { strict as assert } from 'node:assert';
import { mock, test } from 'node:test';
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import AuthContext from '../../context/AuthContext.jsx';
import Layout from './Layout.jsx';

const renderLayout = ({ isAuthenticated = false, logout = () => {}, initialEntries = ['/karaoke'] } = {}) => {
  let currentLocation = null;

  const LocationProbe = () => {
    const location = useLocation();
    currentLocation = location.pathname;
    return <div data-testid="location">{location.pathname}</div>;
  };

  render(
    <MemoryRouter initialEntries={initialEntries}>
      <AuthContext.Provider value={{ isAuthenticated, logout }}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/karaoke" element={<LocationProbe />} />
            <Route path="/aik2" element={<LocationProbe />} />
            <Route path="/ai-karaoke" element={<LocationProbe />} />
          </Route>
        </Routes>
      </AuthContext.Provider>
    </MemoryRouter>,
  );

  return () => currentLocation;
};

test('renders guest navigation with karaoke and sign-in links', () => {
  const getLocation = renderLayout({ isAuthenticated: false });

  assert.ok(screen.getByRole('link', { name: 'Караоке' }));
  assert.ok(screen.getByRole('link', { name: 'Вход' }));
  assert.equal(screen.queryByRole('link', { name: 'ИИ-Караоке' }), null);
  assert.equal(screen.queryByRole('button', { name: 'Выход' }), null);
  assert.equal(getLocation(), '/karaoke');
});

test('renders authenticated navigation with AI karaoke and logout', () => {
  renderLayout({ isAuthenticated: true });

  assert.ok(screen.getByRole('link', { name: 'Караоке' }));
  assert.ok(screen.getByRole('link', { name: 'ИИ-Караоке' }));
  assert.ok(screen.getByRole('button', { name: 'Выход' }));
  assert.equal(screen.queryByRole('link', { name: 'Вход' }), null);
});

test('navigates to AI karaoke page for authenticated users', () => {
  const getLocation = renderLayout({ isAuthenticated: true });

  fireEvent.click(screen.getByRole('link', { name: 'ИИ-Караоке' }));

  assert.equal(getLocation(), '/ai-karaoke');
});

test('logout triggers auth cleanup and redirects to sign-in', async () => {
  const logoutMock = mock.fn();
  const getLocation = renderLayout({ isAuthenticated: true, logout: logoutMock });

  fireEvent.click(screen.getByRole('button', { name: 'Выход' }));

  assert.equal(logoutMock.mock.calls.length, 1);
  await waitFor(() => {
    assert.equal(getLocation(), '/aik2');
  });
});
