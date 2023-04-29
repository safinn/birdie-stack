import type { LoaderArgs } from '@remix-run/node'
import { useParams } from '@remix-run/react'
import { emailConstructors } from '~/utils/email-templates'

export function loader({ params }: LoaderArgs) {
  if (!params.email || !emailConstructors[params.email])
    throw new Response('Not Found', {
      status: 404,
    })

  return new Response()
}

export default function Email() {
  const { email } = useParams()

  return (
    <div
      className="p-5"
      dangerouslySetInnerHTML={{ __html: emailConstructors[email!]() }}
    />
  )
}
