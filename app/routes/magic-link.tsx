import type { DataFunctionArgs } from '@remix-run/node'
import { authenticator } from '~/services/auth.server'
import { redirectToCookie } from '~/services/cookies.server'

export async function loader({ request, params }: DataFunctionArgs) {
  const user = await authenticator.isAuthenticated(request, {
    successRedirect: '/account',
  })

  if (!user) {
    const cookie = request.headers.get('Cookie')
    const redirectTo = await redirectToCookie.parse(cookie)

    await authenticator.authenticate('OTP', request, {
      successRedirect: redirectTo || '/account',
      failureRedirect: '/login',
    })
  }
}
