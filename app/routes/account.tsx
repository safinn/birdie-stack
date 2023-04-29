import type { DataFunctionArgs } from '@remix-run/node'

import { json } from '@remix-run/node'
import { Form, useLoaderData } from '@remix-run/react'
import { requireUser } from '~/services/auth.server'

export async function loader({ request }: DataFunctionArgs) {
  const [user] = await requireUser(request)

  return json({ user })
}

export default function Account() {
  let { user } = useLoaderData<typeof loader>()

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.4' }}>
      <h1>{user ? `Welcome ${user.email}` : 'Authenticate'}</h1>

      <Form action="/logout" method="post">
        <button>Log Out</button>
      </Form>
    </div>
  )
}
