import type { LoaderArgs } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { NavLink, Outlet } from '@remix-run/react'
import { emailConstructors } from '~/utils/email-templates'

export function loader({ request }: LoaderArgs) {
  const path = new URL(request.url).pathname
  if (path === '/emails' || path === '/emails/') {
    const first = Object.keys(emailConstructors)[0]
    return redirect(first)
  }

  return new Response()
}

export default function Emails() {
  return (
    <>
      <ul className="flex space-x-5 p-5">
        {Object.keys(emailConstructors).map((key) => (
          <li key={key} className="capitalize">
            <NavLink
              to={`${key}`}
              className={({ isActive, isPending }) =>
                isPending ? 'text-black' : isActive ? 'font-bold' : ''
              }
            >
              {key}
            </NavLink>
          </li>
        ))}
      </ul>

      <Outlet />
    </>
  )
}
