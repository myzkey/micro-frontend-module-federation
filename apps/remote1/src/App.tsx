import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Remote App 1 - Counter</h2>
        <p style={styles.description}>
          This component is loaded from a separate micro frontend.
        </p>
        <div style={styles.counter}>
          <button style={styles.button} onClick={() => setCount(c => c - 1)}>
            -
          </button>
          <span style={styles.count}>{count}</span>
          <button style={styles.button} onClick={() => setCount(c => c + 1)}>
            +
          </button>
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
}

export default App
