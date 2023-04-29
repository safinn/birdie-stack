import type { DataFunctionArgs } from '@remix-run/node'
import { users } from '~/db/pg/schema'
import { db } from '~/services/db.server'

export async function loader({ request }: DataFunctionArgs) {
  const host =
    request.headers.get('X-Forwarded-Host') ?? request.headers.get('host')

  try {
    const url = new URL('/', `http://${host}`)
    // if we can connect to the database and make a simple query
    // and make a HEAD request to ourselves, then we're good.
    await Promise.all([
      (await db.select().from(users)).length,
      fetch(url.toString(), { method: 'HEAD' }).then((r) => {
        if (!r.ok) return Promise.reject(r)
      }),
    ])
    return new Response('OK')
  } catch (error: unknown) {
    console.log('healthcheck ❌', { error })
    return new Response('ERROR', { status: 500 })
  }
}
