import type { Config } from 'drizzle-kit'

export default {
  schema: './app/db/pg/schema.ts',
  out: './migrations',
} satisfies Config
