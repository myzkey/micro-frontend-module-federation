import React, { Suspense, useState, useCallback } from 'react'
import { useGlobalStore, type Message } from '@mf/shared'

const Remote1App = React.lazy(() => import('remote1/App'))
const Remote2App = React.lazy(() => import('remote2/App'))

type ViewMode = 'home' | 'remote1' | 'remote2' | 'both'

function App() {
  const [activeApp, setActiveApp] = useState<ViewMode>('both')
  const [remote1Count, setRemote1Count] = useState<number | null>(null)
  const [userInput, setUserInput] = useState('')

  // Zustand Store
  const { globalUser, setGlobalUser, messages, addMessage, clearMessages } =
    useGlobalStore()

  const handleCountChange = useCallback((count: number) => {
    setRemote1Count(count)
  }, [])

  const handleSetUser = () => {
    if (userInput.trim()) {
      setGlobalUser(userInput)
      setUserInput('')
    }
  }

  const handleSendMessage = () => {
    addMessage('Hello from Host!', 'host')
  }

  const getFromColor = (from: Message['from']) => {
    switch (from) {
      case 'host':
        return '#1a1a2e'
      case 'remote1':
        return '#3498db'
      case 'remote2':
        return '#e74c3c'
    }
  }

  return (
    <div className="container">
      <header className="header">
        <h1>Micro Frontend Host</h1>

        {/* Props経由の表示 */}
        {remote1Count !== null && (
          <p className="status status-props">
            <span className="method-badge props">Props</span>
            Remote1 Count: {remote1Count}
          </p>
        )}

        {/* Zustand経由のグローバルユーザー */}
        {globalUser && (
          <p className="status status-zustand">
            <span className="method-badge zustand">Zustand</span>
            Global User: {globalUser}
          </p>
        )}

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
        {/* Zustand メッセージパネル */}
        <div className="message-panel">
          <h3>
            <span className="method-badge zustand">Zustand</span>
            Shared Messages
          </h3>
          <div className="message-controls">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Set global user..."
              onKeyDown={(e) => e.key === 'Enter' && handleSetUser()}
            />
            <button onClick={handleSetUser}>Set User</button>
            <button onClick={handleSendMessage}>Send from Host</button>
            <button onClick={clearMessages}>Clear</button>
          </div>
          <div className="message-list">
            {messages.length === 0 ? (
              <p className="no-messages">No messages yet</p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className="message-item"
                  style={{ borderLeftColor: getFromColor(msg.from) }}
                >
                  <span
                    className="message-from"
                    style={{ color: getFromColor(msg.from) }}
                  >
                    {msg.from}
                  </span>
                  <span className="message-text">{msg.text}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <Suspense fallback={<div className="loading">Loading...</div>}>
          {activeApp === 'remote1' && (
            <Remote1App userName="Taro" onCountChange={handleCountChange} />
          )}
          {activeApp === 'remote2' && <Remote2App />}
          {activeApp === 'both' && (
            <div className="grid">
              <Remote1App userName="Taro" onCountChange={handleCountChange} />
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
