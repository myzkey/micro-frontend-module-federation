import { useState, useEffect } from 'react'
import { useGlobalStore } from '@mf/shared'

interface Todo {
  id: number
  text: string
  completed: boolean
  source?: 'local' | 'event'
}

const Badge = ({ color, children }: { color: string; children: React.ReactNode }) => (
  <span
    style={{
      background: color,
      color: 'white',
      fontSize: '0.65rem',
      padding: '0.15rem 0.4rem',
      borderRadius: '3px',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      marginRight: '0.5rem',
    }}
  >
    {children}
  </span>
)

function App() {
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, text: 'Learn Micro Frontends', completed: false, source: 'local' },
    { id: 2, text: 'Build with Module Federation', completed: true, source: 'local' },
  ])
  const [input, setInput] = useState('')
  const [zustandMsg, setZustandMsg] = useState('')

  // Zustand Store
  const { globalUser, messages, addMessage } = useGlobalStore()

  // Custom Event をリッスン
  useEffect(() => {
    const handler = (e: CustomEvent<{ text: string }>) => {
      setTodos(prev => [
        ...prev,
        { id: Date.now(), text: e.detail.text, completed: false, source: 'event' },
      ])
    }
    window.addEventListener('mf:add-todo', handler as EventListener)
    return () => window.removeEventListener('mf:add-todo', handler as EventListener)
  }, [])

  const addTodo = () => {
    if (input.trim()) {
      setTodos([...todos, { id: Date.now(), text: input, completed: false, source: 'local' }])
      setInput('')
    }
  }

  const toggleTodo = (id: number) => {
    setTodos(
      todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    )
  }

  const deleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id))
  }

  // Zustand 経由でメッセージ送信
  const sendViaZustand = () => {
    if (zustandMsg.trim()) {
      addMessage(zustandMsg, 'remote2')
      setZustandMsg('')
    }
  }

  const getFromColor = (from: string) => {
    switch (from) {
      case 'host': return '#1a1a2e'
      case 'remote1': return '#3498db'
      case 'remote2': return '#e74c3c'
      default: return '#666'
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Remote App 2 - Todo List</h2>

        {/* Zustand経由のグローバルユーザー表示 */}
        {globalUser && (
          <p style={styles.dataRow}>
            <Badge color="#f39c12">Zustand</Badge>
            Global User: {globalUser}
          </p>
        )}

        <p style={styles.description}>
          This component is loaded from another micro frontend.
        </p>

        <div style={styles.inputGroup}>
          <input
            style={styles.input}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTodo()}
            placeholder="Add a new todo..."
          />
          <button style={styles.addButton} onClick={addTodo}>
            Add
          </button>
        </div>

        <ul style={styles.list}>
          {todos.map(todo => (
            <li key={todo.id} style={styles.item}>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
              />
              <span
                style={{
                  ...styles.text,
                  textDecoration: todo.completed ? 'line-through' : 'none',
                  color: todo.completed ? '#999' : '#333',
                }}
              >
                {todo.source === 'event' && <Badge color="#9b59b6">Event</Badge>}
                {todo.text}
              </span>
              <button
                style={styles.deleteButton}
                onClick={() => deleteTodo(todo.id)}
              >
                x
              </button>
            </li>
          ))}
        </ul>

        {/* Zustand セクション */}
        <div style={styles.sendSection}>
          <h3 style={styles.subtitle}>
            <Badge color="#f39c12">Zustand</Badge>
            Send Message
          </h3>
          <div style={styles.inputGroup}>
            <input
              style={styles.input}
              type="text"
              value={zustandMsg}
              onChange={e => setZustandMsg(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendViaZustand()}
              placeholder="Send message via Zustand..."
            />
            <button style={styles.sendButtonOrange} onClick={sendViaZustand}>
              Send
            </button>
          </div>
        </div>

        {/* Zustand メッセージ一覧 */}
        <div style={styles.sendSection}>
          <h3 style={styles.subtitle}>
            <Badge color="#f39c12">Zustand</Badge>
            Messages ({messages.length})
          </h3>
          <div style={styles.messageList}>
            {messages.length === 0 ? (
              <p style={styles.noMessages}>No messages</p>
            ) : (
              messages.map(msg => (
                <div key={msg.id} style={{ ...styles.messageItem, borderLeftColor: getFromColor(msg.from) }}>
                  <span style={{ ...styles.messageFrom, color: getFromColor(msg.from) }}>{msg.from}</span>
                  <span>{msg.text}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '1rem',
  },
  card: {
    background: 'white',
    borderRadius: '8px',
    padding: '2rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    borderLeft: '4px solid #e74c3c',
  },
  title: {
    color: '#e74c3c',
    marginBottom: '0.5rem',
  },
  dataRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.5rem',
    color: '#333',
  },
  description: {
    color: '#666',
    marginBottom: '1.5rem',
  },
  inputGroup: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  input: {
    flex: 1,
    padding: '0.5rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '0.9rem',
  },
  addButton: {
    padding: '0.5rem 1rem',
    background: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  list: {
    listStyle: 'none',
    padding: 0,
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 0',
    borderBottom: '1px solid #eee',
  },
  text: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
  },
  deleteButton: {
    background: 'none',
    border: 'none',
    color: '#999',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  sendSection: {
    marginTop: '1.5rem',
    paddingTop: '1rem',
    borderTop: '1px solid #eee',
  },
  subtitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#333',
    fontSize: '0.9rem',
    marginBottom: '0.5rem',
  },
  sendButtonOrange: {
    padding: '0.5rem 1rem',
    background: '#f39c12',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  messageList: {
    maxHeight: '120px',
    overflowY: 'auto',
    border: '1px solid #eee',
    borderRadius: '4px',
    padding: '0.5rem',
  },
  noMessages: {
    color: '#999',
    fontSize: '0.85rem',
    textAlign: 'center',
  },
  messageItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.3rem',
    borderLeft: '3px solid',
    marginBottom: '0.25rem',
    background: '#f9f9f9',
    borderRadius: '0 4px 4px 0',
    fontSize: '0.85rem',
  },
  messageFrom: {
    fontWeight: 'bold',
    fontSize: '0.75rem',
    minWidth: '50px',
  },
}

export default App
