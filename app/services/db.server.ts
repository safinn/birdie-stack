import postgres from 'postgres'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { drizzle } from 'drizzle-orm/postgres-js'
import invariant from 'tiny-invariant'

let db: PostgresJsDatabase

declare global {
  var __db__: PostgresJsDatabase
}

let {
  DATABASE_HOST,
  DATABASE_PORT,
  DATABASE_DB,
  DATABASE_USERNAME,
  DATABASE_PASSWORD,
} = process.env
invariant(typeof DATABASE_HOST === 'string', 'DATABASE_HOST env var not set')
invariant(typeof DATABASE_PORT === 'string', 'DATABASE_PORT env var not set')
invariant(typeof DATABASE_DB === 'string', 'DATABASE_DB env var not set')
invariant(
  typeof DATABASE_USERNAME === 'string',
  'DATABASE_USERNAME env var not set'
)
invariant(
  typeof DATABASE_PASSWORD === 'string',
  'DATABASE_PASSWORD env var not set'
)

// this is needed because in development we don't want to restart
// the server with every change, but we want to make sure we don't
// create a new connection to the DB with every change either.
// in production we'll have a single connection to the DB.
if (process.env.NODE_ENV === 'production') {
  const queryClient = postgres({
    transform: postgres.camel,
    host: DATABASE_HOST,
    port: Number(DATABASE_PORT),
    database: DATABASE_DB,
    username: DATABASE_USERNAME,
    password: DATABASE_PASSWORD,
  })
  db = drizzle(queryClient)
} else {
  if (!global.__db__) {
    const queryClient = postgres({
      transform: postgres.camel,
      host: DATABASE_HOST,
      port: Number(DATABASE_PORT),
      database: DATABASE_DB,
      username: DATABASE_USERNAME,
      password: DATABASE_PASSWORD,
    })
    global.__db__ = drizzle(queryClient)
  }
  db = global.__db__
}

export { db }
