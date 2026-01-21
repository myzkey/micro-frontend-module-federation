import { useState } from 'react'

interface Todo {
  id: number
  text: string
  completed: boolean
}

function App() {
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, text: 'Learn Micro Frontends', completed: false },
    { id: 2, text: 'Build with Module Federation', completed: true },
  ])
  const [input, setInput] = useState('')

  const addTodo = () => {
    if (input.trim()) {
      setTodos([...todos, { id: Date.now(), text: input, completed: false }])
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

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Remote App 2 - Todo List</h2>
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
    fontSize: '1rem',
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
  },
  deleteButton: {
    background: 'none',
    border: 'none',
    color: '#999',
    cursor: 'pointer',
    fontSize: '1rem',
  },
}

export default App
