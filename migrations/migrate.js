import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'

const connectionString = process.argv[2]

const sql = postgres(connectionString, { max: 1 })
const db = drizzle(sql)

await migrate(db, { migrationsFolder: 'migrations' })

process.exit()
