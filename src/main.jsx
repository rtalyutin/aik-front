import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import playerStore from './store/player.js'
import './styles/theme.css'

const rootElement = document.getElementById('root')

if (rootElement) {
  if (!document.documentElement.dataset.theme) {
    document.documentElement.dataset.theme = 'male'
  }

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App player={playerStore} />
    </React.StrictMode>,
  )
}
