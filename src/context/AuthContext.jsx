import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext({
  isAuthenticated: false,
  token: '',
  login: () => {},
  logout: () => {},
});

const isTokenValid = (token) => typeof token === 'string' && token.trim().length > 0;

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    if (typeof window === 'undefined') {
      return '';
    }

    const storedToken = window.localStorage.getItem('token');
    return isTokenValid(storedToken) ? storedToken : '';
  });

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key !== 'token') {
        return;
      }

      setToken(isTokenValid(event.newValue) ? event.newValue : '');
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const login = useCallback((nextToken) => {
    if (isTokenValid(nextToken)) {
      window.localStorage.setItem('token', nextToken);
      setToken(nextToken);
      return;
    }

    window.localStorage.removeItem('token');
    setToken('');
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem('token');
    setToken('');
  }, []);

  const isAuthenticated = isTokenValid(token);

  const value = useMemo(
    () => ({
      isAuthenticated,
      token,
      login,
      logout,
    }),
    [isAuthenticated, login, logout, token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const useAuth = () => useContext(AuthContext);

export { AuthProvider, useAuth };
export default AuthContext;
