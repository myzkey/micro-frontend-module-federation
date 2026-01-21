import React, { Suspense, useState } from 'react'

const Remote1App = React.lazy(() => import('remote1/App'))
const Remote2App = React.lazy(() => import('remote2/App'))

type ViewMode = 'home' | 'remote1' | 'remote2' | 'both'

function App() {
  const [activeApp, setActiveApp] = useState<ViewMode>('home')

  return (
    <div className="container">
      <header className="header">
        <h1>Micro Frontend Host</h1>
        <nav className="nav">
          <button
            className={activeApp === 'remote1' ? 'active' : ''}
            onClick={() => setActiveApp('remote1')}
          >
            Remote App 1
          </button>
          <button
            className={activeApp === 'remote2' ? 'active' : ''}
            onClick={() => setActiveApp('remote2')}
          >
            Remote App 2
          </button>
          <button
            className={activeApp === 'both' ? 'active' : ''}
            onClick={() => setActiveApp('both')}
          >
            Both
          </button>
          <button
            className={activeApp === 'home' ? 'active' : ''}
            onClick={() => setActiveApp('home')}
          >
            Home
          </button>
        </nav>
      </header>

      <main className="main">
        <Suspense fallback={<div className="loading">Loading...</div>}>
          {activeApp === 'remote1' && <Remote1App />}
          {activeApp === 'remote2' && <Remote2App />}
          {activeApp === 'both' && (
            <div className="grid">
              <Remote1App />
              <Remote2App />
            </div>
          )}
          {activeApp === 'home' && (
            <div className="home">
              <h2>Welcome to Micro Frontend Demo</h2>
              <p>Select an app from the navigation above.</p>
            </div>
          )}
        </Suspense>
      </main>
    </div>
  )
}

export default App
