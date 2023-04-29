import type { DataFunctionArgs } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Form, useLoaderData } from '@remix-run/react'
import db from '~/db'
import { authenticator } from '~/services/auth.server'
import { invitiationCookie, redirectToCookie } from '~/services/cookies.server'
import { acceptInvitation } from '~/services/invites.server'
import { getSession, commitSession } from '~/services/session.server'

export async function loader({ request }: DataFunctionArgs) {
  const url = new URL(request.url)
  let redirectTo = url.searchParams.get('redirectTo')

  const cookie = request.headers.get('Cookie')
  const redirectToCookieValue = await redirectToCookie.parse(cookie)

  const userSession = await authenticator.isAuthenticated(request)
  if (userSession) {
    const [user] = await db.user.findUserById(userSession.userId)
    // Handle if invite is present in cookie
    const invitationId = await invitiationCookie.parse(cookie)
    if (invitationId) {
      return acceptInvitation(
        invitationId,
        url,
        user,
        request.headers.get('Cookie')
      )
    }

    return redirect(redirectTo || redirectToCookieValue || '/account')
  }

  const session = await getSession(cookie)
  const hasSentEmail = session.has('auth:otp')

  const email = session.get('auth:email')
  const error = session.get(authenticator.sessionErrorKey)

  // Commits Session to clear any possible error message.
  let headers = new Headers()
  headers.set('Set-Cookie', await commitSession(session))
  if (redirectTo) {
    headers.append('Set-Cookie', await redirectToCookie.serialize(redirectTo))
  }
  return json(
    { user: userSession, hasSentEmail, email, error },
    {
      headers,
    }
  )
}

export async function action({ request }: DataFunctionArgs) {
  await authenticator.authenticate('OTP', request, {
    // Setting `successRedirect` is required.
    // ...
    // User is not authenticated yet.
    // We want to redirect to the verify code form. (/verify-code or any other route)
    successRedirect: '/login',

    // Setting `failureRedirect` is required.
    // ...
    // We want to display any possible error message.
    // Otherwise the ErrorBoundary will be triggered.
    failureRedirect: '/login',
  })
}

export default function Login() {
  let { user, hasSentEmail, email, error } = useLoaderData<typeof loader>()

  return (
    <div>
      {/* Renders any possible error messages. */}
      {error && <strong>Error: {error.message}</strong>}

      {/* Renders the form that sends the email. */}
      {!user && !hasSentEmail && (
        <Form method="post" autoComplete="off">
          <label htmlFor="email">Email</label>
          <input name="email" placeholder="Insert email .." required />

          <button type="submit">Send Code</button>
        </Form>
      )}

      {/* Renders the form that verifies the code. */}
      {hasSentEmail && (
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <Form method="post" autoComplete="off">
            <label htmlFor="code">Code</label>
            <input
              type="text"
              name="code"
              placeholder="Insert code .."
              required
            />

            <button type="submit">Continue</button>
          </Form>

          {/* Renders the form that requests a new code. */}
          {/* Email input is not required, the email is already in Session. */}
          <Form method="post" autoComplete="off">
            <button type="submit">Request new Code</button>
          </Form>
        </div>
      )}
    </div>
  )
}
