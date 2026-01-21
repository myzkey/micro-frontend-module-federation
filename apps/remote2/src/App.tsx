import { useState, useEffect } from 'react'
import { useGlobalStore, api, type Message } from '@mf/shared'

interface Todo {
  id: number
  text: string
  completed: boolean
  source?: 'local' | 'event' | 'api'
}

const Badge = ({
  variant,
  children,
}: {
  variant: 'props' | 'event' | 'zustand' | 'api'
  children: React.ReactNode
}) => {
  const colors = {
    props: 'bg-badge-props',
    event: 'bg-badge-event',
    zustand: 'bg-badge-zustand',
    api: 'bg-blue-500',
  }
  return (
    <span
      className={`${colors[variant]} text-white text-[0.65rem] px-2 py-0.5 rounded font-bold uppercase mr-2`}
    >
      {children}
    </span>
  )
}

function App() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [input, setInput] = useState('')
  const [zustandMsg, setZustandMsg] = useState('')
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState<string | null>(null)

  const { globalUser, messages, addMessage } = useGlobalStore()

  // APIからTodo取得
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const data = await api.getTodos()
        setTodos(data.map((t) => ({ ...t, source: 'api' as const })))
        setApiError(null)
      } catch {
        setApiError('API接続エラー - APIサーバーを起動してください')
      } finally {
        setLoading(false)
      }
    }
    fetchTodos()
  }, [])

  // Custom Event をリッスン
  useEffect(() => {
    const handler = async (e: Event) => {
      const customEvent = e as CustomEvent<{ text: string }>
      try {
        const newTodo = await api.createTodo(customEvent.detail.text)
        setTodos((prev) => [...prev, { ...newTodo, source: 'event' }])
      } catch {
        // API失敗時はローカルに追加
        setTodos((prev) => [
          ...prev,
          { id: Date.now(), text: customEvent.detail.text, completed: false, source: 'event' },
        ])
      }
    }
    window.addEventListener('mf:add-todo', handler)
    return () => window.removeEventListener('mf:add-todo', handler)
  }, [])

  const addTodo = async () => {
    if (input.trim()) {
      try {
        const newTodo = await api.createTodo(input)
        setTodos([...todos, { ...newTodo, source: 'api' }])
      } catch {
        setTodos([...todos, { id: Date.now(), text: input, completed: false, source: 'local' }])
      }
      setInput('')
    }
  }

  const toggleTodo = async (id: number) => {
    const todo = todos.find((t) => t.id === id)
    if (!todo) return

    try {
      await api.updateTodo(id, { completed: !todo.completed })
    } catch {
      // APIエラーは無視
    }
    setTodos(
      todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    )
  }

  const deleteTodo = async (id: number) => {
    try {
      await api.deleteTodo(id)
    } catch {
      // APIエラーは無視
    }
    setTodos(todos.filter((t) => t.id !== id))
  }

  const sendViaZustand = () => {
    if (zustandMsg.trim()) {
      addMessage(zustandMsg, 'remote2')
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
      <div className="bg-white rounded-lg p-8 shadow border-l-4 border-l-remote2">
        <h2 className="text-remote2 text-xl font-bold mb-2">
          Remote App 2 - Todo List
          <Badge variant="api">API</Badge>
        </h2>

        {globalUser && (
          <p className="flex items-center gap-2 mb-2 text-gray-800">
            <Badge variant="zustand">Zustand</Badge>
            Global User: {globalUser}
          </p>
        )}

        <p className="text-gray-500 mb-4">
          This component uses Hono API + libsql + Drizzle.
        </p>

        {apiError && (
          <div className="bg-red-100 text-red-700 px-3 py-2 rounded mb-4 text-sm">
            {apiError}
          </div>
        )}

        <div className="flex gap-2 mb-4">
          <input
            className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTodo()}
            placeholder="Add a new todo..."
          />
          <button
            className="px-4 py-2 bg-remote2 text-white rounded cursor-pointer border-none hover:bg-remote2-light"
            onClick={addTodo}
          >
            Add
          </button>
        </div>

        {loading ? (
          <p className="text-gray-400 text-center py-4">Loading...</p>
        ) : (
          <ul className="list-none p-0">
            {todos.map((todo) => (
              <li
                key={todo.id}
                className="flex items-center gap-2 py-2 border-b border-gray-100"
              >
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id)}
                  className="cursor-pointer"
                />
                <span
                  className={`flex-1 flex items-center ${
                    todo.completed ? 'line-through text-gray-400' : 'text-gray-800'
                  }`}
                >
                  {todo.source === 'event' && <Badge variant="event">Event</Badge>}
                  {todo.source === 'api' && <Badge variant="api">DB</Badge>}
                  {todo.text}
                </span>
                <button
                  className="bg-transparent border-none text-gray-400 cursor-pointer text-lg hover:text-gray-600"
                  onClick={() => deleteTodo(todo.id)}
                >
                  x
                </button>
              </li>
            ))}
          </ul>
        )}

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
