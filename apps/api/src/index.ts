import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { eq } from 'drizzle-orm'
import { db } from './db/client'
import { todos, messages } from './db/schema'

const app = new Hono()

// CORS設定（フロントエンドからのアクセスを許可）
app.use(
  '*',
  cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  })
)

// Health check
app.get('/', (c) => c.json({ status: 'ok', message: 'Micro Frontend API' }))

// ===== Todos API =====

// 全件取得
app.get('/todos', async (c) => {
  const result = await db.select().from(todos).orderBy(todos.createdAt)
  return c.json(result)
})

// 作成
app.post('/todos', async (c) => {
  const body = await c.req.json<{ text: string }>()
  const result = await db.insert(todos).values({ text: body.text }).returning()
  return c.json(result[0], 201)
})

// 更新（完了トグル）
app.patch('/todos/:id', async (c) => {
  const id = Number(c.req.param('id'))
  const body = await c.req.json<{ completed?: boolean; text?: string }>()

  const result = await db
    .update(todos)
    .set(body)
    .where(eq(todos.id, id))
    .returning()

  if (result.length === 0) {
    return c.json({ error: 'Not found' }, 404)
  }
  return c.json(result[0])
})

// 削除
app.delete('/todos/:id', async (c) => {
  const id = Number(c.req.param('id'))
  const result = await db.delete(todos).where(eq(todos.id, id)).returning()

  if (result.length === 0) {
    return c.json({ error: 'Not found' }, 404)
  }
  return c.json({ success: true })
})

// ===== Messages API =====

// 全件取得
app.get('/messages', async (c) => {
  const result = await db.select().from(messages).orderBy(messages.createdAt)
  return c.json(result)
})

// 作成
app.post('/messages', async (c) => {
  const body = await c.req.json<{ text: string; from: 'host' | 'remote1' | 'remote2' }>()
  const result = await db
    .insert(messages)
    .values({ text: body.text, from: body.from })
    .returning()
  return c.json(result[0], 201)
})

// 全削除
app.delete('/messages', async (c) => {
  await db.delete(messages)
  return c.json({ success: true })
})

const port = 3003
console.log(`Server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port,
})
