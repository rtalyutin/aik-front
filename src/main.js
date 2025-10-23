import './style.css'
import { setupCounter } from './setupCounter.js'

const app = document.querySelector('#app')

if (!app) {
  throw new Error('Root element #app not found')
}

app.innerHTML = `
  <div>
    <a href="https://vitejs.dev" target="_blank" rel="noreferrer">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://react.dev" target="_blank" rel="noreferrer">
      <img src="./src/assets/react.svg" class="logo react" alt="React logo" />
    </a>
  </div>
  <h1>Static Counter Demo</h1>
  <div class="card">
    <button id="counter" type="button"></button>
    <p>
      Edit <code>src/main.js</code> and save to test live reload
    </p>
  </div>
  <p class="read-the-docs">
    Click on the Vite and React logos to learn more
  </p>
`

const counterButton = document.querySelector('#counter')
if (!counterButton) {
  throw new Error('Counter button not rendered')
}

setupCounter(counterButton)
