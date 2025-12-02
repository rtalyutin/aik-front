import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import ConfigErrorScreen from './components/ConfigErrorScreen.jsx';
import { getApiInitError } from './config/apiEndpoints.js';
import { AuthProvider } from './context/AuthContext.jsx';
import './styles.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root container missing in index.html');
}

const apiInitError = getApiInitError();

const content = apiInitError ? (
  <ConfigErrorScreen
    missingKeys={apiInitError?.missingKeys ?? []}
    details={apiInitError?.details ?? (apiInitError?.message ? [apiInitError.message] : [])}
  />
) : (
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
);

ReactDOM.createRoot(rootElement).render(<React.StrictMode>{content}</React.StrictMode>);
