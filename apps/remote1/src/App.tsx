import { useState, useEffect } from 'react'
import { useGlobalStore } from '@mf/shared'

interface AppProps {
  userName?: string
  onCountChange?: (count: number) => void
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
    }}
  >
    {children}
  </span>
)

function App({ userName, onCountChange }: AppProps) {
  const [count, setCount] = useState(0)
  const [todoText, setTodoText] = useState('')
  const [zustandMsg, setZustandMsg] = useState('')

  // Zustand Store
  const { globalUser, messages, addMessage } = useGlobalStore()

  useEffect(() => {
    onCountChange?.(count)
  }, [count, onCountChange])

  const handleChange = (delta: number) => {
    setCount(c => c + delta)
  }

  // Custom Event で Remote2 に送信
  const sendToRemote2 = () => {
    if (todoText.trim()) {
      window.dispatchEvent(
        new CustomEvent('mf:add-todo', { detail: { text: todoText } })
      )
      setTodoText('')
    }
  }

  // Zustand 経由でメッセージ送信
  const sendViaZustand = () => {
    if (zustandMsg.trim()) {
      addMessage(zustandMsg, 'remote1')
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
        <h2 style={styles.title}>Remote App 1 - Counter</h2>

        {/* Props経由のデータ表示 */}
        {userName && (
          <p style={styles.dataRow}>
            <Badge color="#2ecc71">Props</Badge>
            Hello, {userName}!
          </p>
        )}

        {/* Zustand経由のグローバルユーザー表示 */}
        {globalUser && (
          <p style={styles.dataRow}>
            <Badge color="#f39c12">Zustand</Badge>
            Global User: {globalUser}
          </p>
        )}

        <p style={styles.description}>
          This component is loaded from a separate micro frontend.
        </p>

        <div style={styles.counter}>
          <button style={styles.button} onClick={() => handleChange(-1)}>
            -
          </button>
          <span style={styles.count}>{count}</span>
          <button style={styles.button} onClick={() => handleChange(1)}>
            +
          </button>
        </div>

        {/* Custom Event セクション */}
        <div style={styles.sendSection}>
          <h3 style={styles.subtitle}>
            <Badge color="#9b59b6">Event</Badge>
            Send to Remote2
          </h3>
          <div style={styles.inputGroup}>
            <input
              style={styles.input}
              type="text"
              value={todoText}
              onChange={e => setTodoText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendToRemote2()}
              placeholder="Add todo to Remote2..."
            />
            <button style={styles.sendButtonPurple} onClick={sendToRemote2}>
              Send
            </button>
          </div>
        </div>

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
    borderLeft: '4px solid #3498db',
  },
  title: {
    color: '#3498db',
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
  counter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
  },
  button: {
    width: '40px',
    height: '40px',
    fontSize: '1.5rem',
    border: 'none',
    borderRadius: '50%',
    background: '#3498db',
    color: 'white',
    cursor: 'pointer',
  },
  count: {
    fontSize: '2rem',
    fontWeight: 'bold',
    minWidth: '60px',
    textAlign: 'center',
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
  inputGroup: {
    display: 'flex',
    gap: '0.5rem',
  },
  input: {
    flex: 1,
    padding: '0.5rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '0.9rem',
  },
  sendButtonPurple: {
    padding: '0.5rem 1rem',
    background: '#9b59b6',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
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
