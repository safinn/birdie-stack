import { Authenticator } from 'remix-auth'
import { sessionStorage } from '~/services/session.server'
import { redirect } from '@remix-run/node'
import { OTPStrategy } from 'remix-auth-otp'
import invariant from 'tiny-invariant'
import { render } from '@react-email/render'
import { sendEmail } from './email.server'
import Login from '~/../emails/login'
import store, { transaction } from '~/db'

export type UserSession = {
  userId: string
  defaultOrganisationId: string
}

const { OTP_SECRET, NODE_ENV } = process.env
invariant(OTP_SECRET, 'OTP_SECRET must be set')

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
export let authenticator = new Authenticator<UserSession>(sessionStorage)

authenticator.use(
  new OTPStrategy(
    {
      secret: OTP_SECRET,
      storeCode: async (code) => {
        await store.otp.createOtp(code)
      },
      sendCode: async ({ email, code, magicLink, user, form, request }) => {
        const url = new URL(request.url)
        const html = render(
          <Login
            appName={process.env.ORIGINAL_APP_NAME!}
            validationCode={code}
            validationLink={magicLink}
            baseUrl={url.origin}
          />
        )
        if (NODE_ENV === 'development') {
          console.log(`Code: ${code}, Magic Link: ${magicLink}`)
        }

        await sendEmail(email, 'Login to Birdie Stack', html)
      },
      validateCode: async (code) => {
        const [oneTimePasscode] = await store.otp.findOtpByCode(code)

        if (!oneTimePasscode) {
          throw new Error('OTP code not found')
        }

        return {
          code: oneTimePasscode.code,
          active: oneTimePasscode.active,
          attempts: oneTimePasscode.attempts,
        }
      },
      invalidateCode: async (code, active, attempts) => {
        await store.otp.updateOtp(code, active, attempts)
      },
    },
    async ({ email, code, form, magicLink, request }) => {
      // You can determine whether the user is authenticating
      // via OTP submission or Magic Link and run your own logic.
      // (This is optional)
      if (form) {
        console.log('OTP code form submission.')
      }

      if (magicLink) {
        console.log('Magic Link clicked.')
      }

      // Gets user from database.
      // This is the right place to create a new user (if not exists).
      const [existingUser] = await store.user.findUserByEmail(email)

      if (!existingUser) {
        const [newUser, newOrganisation] = await transaction(async (store) => {
          const [newOrganisation] = await store.organisation.createOrganisation(
            'Personal',
            'Personal team'
          )
          const [newUser] = await store.user.createUser(
            email,
            newOrganisation.id
          )
          await store.membership.createMembership(
            newUser.id,
            newOrganisation.id
          )

          return [newUser, newOrganisation]
        })

        // Returns newly created user as Session.
        return { userId: newUser.id, defaultOrganisationId: newOrganisation.id }
      }

      // Returns the user from database as Session.
      return {
        userId: existingUser.id,
        defaultOrganisationId: existingUser.defaultOrganisationId,
      }
    }
  )
)

export async function getSessionInfo(request: Request) {
  const session = await sessionStorage.getSession(request.headers.get('Cookie'))
  const userSession: UserSession = session.get(authenticator.sessionKey)

  return userSession
}

export async function getUserId(request: Request) {
  const user = await authenticator.isAuthenticated(request)
  return user?.userId
}

export async function getUser(request: Request) {
  const userId = await getUserId(request)
  if (userId === undefined) return null

  const [user] = await store.user.findUserById(userId)
  if (user) return user

  throw await logout(request, new URL(request.url).pathname)
}

export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const userId = await getUserId(request)
  if (!userId) {
    const searchParams = new URLSearchParams([['redirectTo', redirectTo]])
    throw redirect(`/login?${searchParams}`)
  }
  return userId
}

export async function requireUser(request: Request) {
  const userId = await requireUserId(request)

  const user = await store.user.findUserById(userId)
  if (user) return user

  throw await logout(request, new URL(request.url).pathname)
}

export async function logout(request: Request, redirectTo?: string) {
  const searchParams = new URLSearchParams()
  if (redirectTo) {
    searchParams.append('redirectTo', redirectTo)
  }
  return await authenticator.logout(request, {
    redirectTo:
      '/login' + (searchParams.has('redirectTo') ? `?${searchParams}` : ''),
  })
}
