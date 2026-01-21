import React, { Suspense, useState, useCallback } from 'react'
import { useGlobalStore, type Message } from '@mf/shared'

const Remote1App = React.lazy(() => import('remote1/App'))
const Remote2App = React.lazy(() => import('remote2/App'))

type ViewMode = 'home' | 'remote1' | 'remote2' | 'both'

const Badge = ({
  variant,
  children,
}: {
  variant: 'props' | 'event' | 'zustand'
  children: React.ReactNode
}) => {
  const colors = {
    props: 'bg-badge-props',
    event: 'bg-badge-event',
    zustand: 'bg-badge-zustand',
  }
  return (
    <span
      className={`${colors[variant]} text-white text-[0.65rem] px-2 py-0.5 rounded font-bold uppercase`}
    >
      {children}
    </span>
  )
}

function App() {
  const [activeApp, setActiveApp] = useState<ViewMode>('both')
  const [remote1Count, setRemote1Count] = useState<number | null>(null)
  const [userInput, setUserInput] = useState('')

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
        return { border: 'border-l-host', text: 'text-host' }
      case 'remote1':
        return { border: 'border-l-remote1', text: 'text-remote1' }
      case 'remote2':
        return { border: 'border-l-remote2', text: 'text-remote2' }
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-host text-white px-8 py-4">
        <h1 className="text-2xl font-bold mb-2">Micro Frontend Host</h1>

        {remote1Count !== null && (
          <p className="inline-flex items-center gap-2 px-3 py-1 rounded bg-white/10 text-sm mb-2 mr-2">
            <Badge variant="props">Props</Badge>
            Remote1 Count: {remote1Count}
          </p>
        )}

        {globalUser && (
          <p className="inline-flex items-center gap-2 px-3 py-1 rounded bg-white/10 text-sm mb-2 mr-2">
            <Badge variant="zustand">Zustand</Badge>
            Global User: {globalUser}
          </p>
        )}

        <nav className="flex gap-2 mt-2">
          {(['remote1', 'remote2', 'both', 'home'] as const).map((mode) => (
            <button
              key={mode}
              className={`px-4 py-2 rounded border-none cursor-pointer transition-colors ${
                activeApp === mode
                  ? 'bg-[#e94560]'
                  : 'bg-[#16213e] hover:bg-[#0f3460]'
              }`}
              onClick={() => setActiveApp(mode)}
            >
              {mode === 'remote1'
                ? 'Remote App 1'
                : mode === 'remote2'
                  ? 'Remote App 2'
                  : mode === 'both'
                    ? 'Both'
                    : 'Home'}
            </button>
          ))}
        </nav>
      </header>

      <main className="p-8">
        <div className="bg-white rounded-lg p-4 mb-6 shadow border-l-4 border-l-badge-zustand">
          <h3 className="flex items-center gap-2 mb-3 text-gray-800">
            <Badge variant="zustand">Zustand</Badge>
            Shared Messages
          </h3>
          <div className="flex gap-2 mb-3 flex-wrap">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Set global user..."
              onKeyDown={(e) => e.key === 'Enter' && handleSetUser()}
              className="flex-1 min-w-[150px] px-3 py-2 border border-gray-300 rounded text-sm"
            />
            <button
              onClick={handleSetUser}
              className="px-3 py-2 bg-badge-zustand text-white rounded text-sm hover:bg-orange-500 cursor-pointer border-none"
            >
              Set User
            </button>
            <button
              onClick={handleSendMessage}
              className="px-3 py-2 bg-badge-zustand text-white rounded text-sm hover:bg-orange-500 cursor-pointer border-none"
            >
              Send from Host
            </button>
            <button
              onClick={clearMessages}
              className="px-3 py-2 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 cursor-pointer border-none"
            >
              Clear
            </button>
          </div>
          <div className="max-h-[150px] overflow-y-auto border border-gray-200 rounded p-2">
            {messages.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-2">
                No messages yet
              </p>
            ) : (
              messages.map((msg) => {
                const colors = getFromColor(msg.from)
                return (
                  <div
                    key={msg.id}
                    className={`flex items-center gap-2 p-2 border-l-[3px] ${colors.border} mb-1 bg-gray-50 rounded-r`}
                  >
                    <span className={`font-bold text-xs min-w-[60px] ${colors.text}`}>
                      {msg.from}
                    </span>
                    <span className="text-sm text-gray-800">{msg.text}</span>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <Suspense
          fallback={
            <div className="text-center py-8 text-gray-500">Loading...</div>
          }
        >
          {activeApp === 'remote1' && (
            <Remote1App userName="Taro" onCountChange={handleCountChange} />
          )}
          {activeApp === 'remote2' && <Remote2App />}
          {activeApp === 'both' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Remote1App userName="Taro" onCountChange={handleCountChange} />
              <Remote2App />
            </div>
          )}
          {activeApp === 'home' && (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-host mb-4">
                Welcome to Micro Frontend Demo
              </h2>
              <p className="text-gray-500">
                Select an app from the navigation above.
              </p>
            </div>
          )}
        </Suspense>
      </main>
    </div>
  )
}

export default App
