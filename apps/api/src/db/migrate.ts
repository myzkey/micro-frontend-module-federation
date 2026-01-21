import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import { migrate } from 'drizzle-orm/libsql/migrator'
import { mkdir } from 'fs/promises'

async function main() {
  await mkdir('./data', { recursive: true })

  const client = createClient({
    url: 'file:./data/local.db',
  })

  const db = drizzle(client)

  console.log('Running migrations...')
  await migrate(db, { migrationsFolder: './drizzle' })
  console.log('Migrations complete!')

  client.close()
}

main().catch(console.error)
