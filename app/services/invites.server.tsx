import { render } from '@react-email/render'
import db, { transaction } from '~/db'
import InviteEmail from '~/../emails/invite'
import type { UserDto } from '~/db/model/User'
import { sendEmail } from './email.server'
import { json, redirect } from '@remix-run/node'
import invariant from 'tiny-invariant'
import type { InvitationDto } from '~/db/model/Invitation'
import type { UserSession } from './auth.server'
import { authenticator } from './auth.server'
import { commitSession } from './session.server'
import { invitiationCookie } from './cookies.server'

const { ORIGINAL_APP_NAME } = process.env
invariant(
  typeof ORIGINAL_APP_NAME === 'string',
  'ORIGINAL_APP_NAME env must be set'
)

// Creates a new invitation and sends email
export async function createInvite(
  user: UserDto,
  organisationId: string,
  email: string,
  requestUrl: string
) {
  return transaction(async (store) => {
    try {
      const [membership] = await store.membership.getMembershipByIdForUser(
        organisationId,
        user.id
      )

      // User is not part of the organisation so cannot send invites for it
      if (!membership) {
        return json(
          {
            message: 'Cannot create invite when not part of the organisation',
          },
          { status: 403 }
        )
      }

      const [org] = await store.organisation.getOrganisationById(organisationId)

      const [invite] = await store.invitation.createInvitation(
        user.id,
        organisationId,
        email
      )

      const url = new URL(requestUrl)
      url.searchParams.set('invite', invite.id)

      const html = render(
        <InviteEmail
          appName={ORIGINAL_APP_NAME!}
          fromEmail={user.email}
          organisationName={org.name}
          inviteLink={url.toString()}
          baseUrl={url.origin}
        />
      )

      await sendEmail(
        email,
        `Invite to join ${org.name} on ${ORIGINAL_APP_NAME}`,
        html
      )

      return json({ message: 'Invitation created' })
    } catch (err) {
      return json({ message: 'Internal Server Error' }, { status: 500 })
    }
  })
}

export async function acceptInvitation(
  invitationId: string,
  requestUrl: URL,
  user: UserDto | null,
  cookies: string | null
) {
  let invitation: InvitationDto
  try {
    ;[invitation] = await db.invitation.getInvitationById(invitationId)
    if (!invitation) throw new Error('Invitation not found')
  } catch (err) {
    requestUrl.searchParams.delete('invite')
    return redirect(requestUrl.toString())
  }

  // If already accepted or cancelled redirect
  if (
    (invitation.acceptedAt && invitation.acceptedBy) ||
    (invitation.cancelledAt && invitation.cancelledBy)
  ) {
    requestUrl.searchParams.delete('invite')
    return redirect(requestUrl.toString())
  }

  if (user) {
    const [membership] = await db.membership.getMembershipByIdForUser(
      invitation.organisationId,
      user.id
    )

    // Update session details
    const session = await sessionStorage.getSession(cookies)
    const userSession: UserSession = session.get(authenticator.sessionKey)
    userSession.defaultOrganisationId = invitation.organisationId
    session.set(authenticator.sessionKey, userSession)

    // Set new default organisation id for user
    user.defaultOrganisationId = invitation.organisationId

    if (membership) {
      await db.user.updateUser(user)

      return redirect('/account', {
        headers: {
          'Set-Cookie': await commitSession(session),
        },
      })
    }

    try {
      await transaction(async (store) => {
        await store.user.updateUser(user)
        await store.invitation.acceptInvitation(invitation.id, user.id)
        await store.membership.createMembership(
          user.id,
          invitation.organisationId
        )
      })
    } catch (err) {
      return redirect('/')
    }

    return redirect('/account', {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    })
  }

  return redirect('/login', {
    headers: {
      'Set-Cookie': await invitiationCookie.serialize(invitationId),
    },
  })
}
