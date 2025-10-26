import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import MusicApp from './MusicApp.jsx'
import './index.css'

const container = document.getElementById('root')
const root = createRoot(container)

root.render(
  <StrictMode>
    <MusicApp />
  </StrictMode>,
)
