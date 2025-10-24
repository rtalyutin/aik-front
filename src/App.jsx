import './App.css';

const features = [
  '⚡️ Vite for fast builds and hot module replacement',
  '⚛️ React 18 with strict mode for predictable UI',
  '🧪 Vitest + Testing Library ready for testing'
];

function App() {
  return (
    <div className="app">
      <header className="app__header">
        <img src="/vite.svg" alt="Vite" className="app__logo" />
        <h1>Welcome to AIK Front</h1>
        <p className="app__tagline">Kick-start your next idea with a modern React setup.</p>
      </header>

      <main>
        <section>
          <h2>Out of the box</h2>
          <ul>
            {features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}

export default App;
