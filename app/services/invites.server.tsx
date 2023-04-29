import { db } from '~/db'
import { sendEmail } from './email.server'
import { json, redirect } from '@remix-run/node'
import invariant from 'tiny-invariant'
import type { UserSession } from './auth.server'
import { authenticator } from './auth.server'
import { commitSession } from './session.server'
import { invitiationCookie } from './cookies.server'
import { emailConstructors } from '~/utils/email-templates'
import type { Invitation, User } from '~/db/pg/schema'

const { PUBLIC_APP_NAME } = process.env
invariant(
  typeof PUBLIC_APP_NAME === 'string',
  'PUBLIC_APP_NAME env must be set'
)

// Creates a new invitation and sends email
export async function createInvite(
  user: User,
  organisationId: string,
  email: string,
  requestUrl: string
) {
  return db.transaction(async (store) => {
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

      // const [invite] = await store.invitation.createInvitation(
      //   user.id,
      //   organisationId,
      //   email
      // )

      const [invite] = await store.invitation.createInvitation({
        createdBy: user.id,
        organisationId,
        email,
      })

      const url = new URL(requestUrl)
      url.searchParams.set('invite', invite.id)

      const html = emailConstructors.invite(
        PUBLIC_APP_NAME!,
        user.email,
        org.name,
        url.toString(),
        url.origin
      )

      await sendEmail(
        email,
        `Invite to join ${org.name} on ${PUBLIC_APP_NAME}`,
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
  user: User | null,
  cookies: string | null
) {
  let invitation: Invitation
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
      await db.transaction(async (tx) => {
        await tx.user.updateUser(user)
        await tx.invitation.acceptInvitation(invitation.id, user.id)
        await tx.membership.createMembership({
          userId: user.id,
          organisationId: invitation.organisationId,
        })
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
