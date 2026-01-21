import { useState, useEffect } from 'react'
import { useGlobalStore, type Message } from '@mf/shared'

interface AppProps {
  userName?: string
  onCountChange?: (count: number) => void
}

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

function App({ userName, onCountChange }: AppProps) {
  const [count, setCount] = useState(0)
  const [todoText, setTodoText] = useState('')
  const [zustandMsg, setZustandMsg] = useState('')

  const { globalUser, messages, addMessage } = useGlobalStore()

  useEffect(() => {
    onCountChange?.(count)
  }, [count, onCountChange])

  const handleChange = (delta: number) => {
    setCount((c) => c + delta)
  }

  const sendToRemote2 = () => {
    if (todoText.trim()) {
      window.dispatchEvent(
        new CustomEvent('mf:add-todo', { detail: { text: todoText } })
      )
      setTodoText('')
    }
  }

  const sendViaZustand = () => {
    if (zustandMsg.trim()) {
      addMessage(zustandMsg, 'remote1')
      setZustandMsg('')
    }
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
    <div className="p-4">
      <div className="bg-white rounded-lg p-8 shadow border-l-4 border-l-remote1">
        <h2 className="text-remote1 text-xl font-bold mb-2">
          Remote App 1 - Counter
        </h2>

        {userName && (
          <p className="flex items-center gap-2 mb-2 text-gray-800">
            <Badge variant="props">Props</Badge>
            Hello, {userName}!
          </p>
        )}

        {globalUser && (
          <p className="flex items-center gap-2 mb-2 text-gray-800">
            <Badge variant="zustand">Zustand</Badge>
            Global User: {globalUser}
          </p>
        )}

        <p className="text-gray-500 mb-6">
          This component is loaded from a separate micro frontend.
        </p>

        <div className="flex items-center justify-center gap-4">
          <button
            className="w-10 h-10 text-2xl border-none rounded-full bg-remote1 text-white cursor-pointer hover:bg-remote1-light"
            onClick={() => handleChange(-1)}
          >
            -
          </button>
          <span className="text-3xl font-bold min-w-[60px] text-center">
            {count}
          </span>
          <button
            className="w-10 h-10 text-2xl border-none rounded-full bg-remote1 text-white cursor-pointer hover:bg-remote1-light"
            onClick={() => handleChange(1)}
          >
            +
          </button>
        </div>

        {/* Custom Event セクション */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h3 className="flex items-center gap-2 text-gray-800 text-sm mb-2">
            <Badge variant="event">Event</Badge>
            Send to Remote2
          </h3>
          <div className="flex gap-2">
            <input
              className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
              type="text"
              value={todoText}
              onChange={(e) => setTodoText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendToRemote2()}
              placeholder="Add todo to Remote2..."
            />
            <button
              className="px-4 py-2 bg-badge-event text-white rounded cursor-pointer border-none hover:bg-purple-600"
              onClick={sendToRemote2}
            >
              Send
            </button>
          </div>
        </div>

        {/* Zustand セクション */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h3 className="flex items-center gap-2 text-gray-800 text-sm mb-2">
            <Badge variant="zustand">Zustand</Badge>
            Send Message
          </h3>
          <div className="flex gap-2">
            <input
              className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
              type="text"
              value={zustandMsg}
              onChange={(e) => setZustandMsg(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendViaZustand()}
              placeholder="Send message via Zustand..."
            />
            <button
              className="px-4 py-2 bg-badge-zustand text-white rounded cursor-pointer border-none hover:bg-orange-500"
              onClick={sendViaZustand}
            >
              Send
            </button>
          </div>
        </div>

        {/* Zustand メッセージ一覧 */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h3 className="flex items-center gap-2 text-gray-800 text-sm mb-2">
            <Badge variant="zustand">Zustand</Badge>
            Messages ({messages.length})
          </h3>
          <div className="max-h-[120px] overflow-y-auto border border-gray-200 rounded p-2">
            {messages.length === 0 ? (
              <p className="text-gray-400 text-sm text-center">No messages</p>
            ) : (
              messages.map((msg) => {
                const colors = getFromColor(msg.from)
                return (
                  <div
                    key={msg.id}
                    className={`flex items-center gap-2 p-1.5 border-l-[3px] ${colors.border} mb-1 bg-gray-50 rounded-r text-sm`}
                  >
                    <span
                      className={`font-bold text-xs min-w-[50px] ${colors.text}`}
                    >
                      {msg.from}
                    </span>
                    <span>{msg.text}</span>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
