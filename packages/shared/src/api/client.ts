const API_BASE = 'http://localhost:3003'

export interface Todo {
  id: number
  text: string
  completed: boolean
  createdAt: string
}

export interface Message {
  id: number
  text: string
  from: 'host' | 'remote1' | 'remote2'
  createdAt: string
}

export const api = {
  // Todos
  async getTodos(): Promise<Todo[]> {
    const res = await fetch(`${API_BASE}/todos`)
    return res.json()
  },

  async createTodo(text: string): Promise<Todo> {
    const res = await fetch(`${API_BASE}/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
    return res.json()
  },

  async updateTodo(id: number, data: { completed?: boolean; text?: string }): Promise<Todo> {
    const res = await fetch(`${API_BASE}/todos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return res.json()
  },

  async deleteTodo(id: number): Promise<void> {
    await fetch(`${API_BASE}/todos/${id}`, { method: 'DELETE' })
  },

  // Messages
  async getMessages(): Promise<Message[]> {
    const res = await fetch(`${API_BASE}/messages`)
    return res.json()
  },

  async createMessage(text: string, from: Message['from']): Promise<Message> {
    const res = await fetch(`${API_BASE}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, from }),
    })
    return res.json()
  },

  async clearMessages(): Promise<void> {
    await fetch(`${API_BASE}/messages`, { method: 'DELETE' })
  },
}
