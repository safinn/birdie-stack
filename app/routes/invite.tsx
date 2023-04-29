import type { ActionArgs, LoaderArgs } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { json } from '@remix-run/node'
import { zfd } from 'zod-form-data'
import { z } from 'zod'
import { getSessionInfo, getUser, requireUser } from '~/services/auth.server'
import { acceptInvitation, createInvite } from '~/services/invites.server'

export async function loader({ request }: LoaderArgs) {
  const user = await getUser(request)

  const url = new URL(request.url)
  const invitationId = url.searchParams.get('invite')

  // Has invite id search parameter
  if (invitationId) {
    return acceptInvitation(
      invitationId,
      url,
      user,
      request.headers.get('Cookie')
    )
  }

  if (!user) {
    // Redirects to login with redirecTo
    const searchParams = new URLSearchParams()
    searchParams.append('redirectTo', '/invite')
    return redirect(`/login?${searchParams}`)
  }

  // TODO Logged in
  //   Return invites for current defaultOrganisationId

  return json({ message: 'invite page' })
}

const inviteSchema = zfd.formData({
  email: zfd.text(z.string().email()),
})

export async function action({ request }: ActionArgs) {
  const [user] = await requireUser(request)
  const { defaultOrganisationId } = await getSessionInfo(request)

  const result = inviteSchema.safeParse(await request.formData())
  if (!result.success) {
    return json(
      {
        message: 'Invalid request',
        error: result.error.flatten().fieldErrors,
      },
      { status: 400 }
    )
  }

  return createInvite(
    user,
    defaultOrganisationId,
    result.data.email,
    request.url
  )
}

export default function Invite() {
  return <div>invite page</div>
}
