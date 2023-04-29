import type { DataFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from '@remix-run/react'
import clsx from 'clsx'
import styles from './styles/tailwind.css'
import {
  NonFlashOfWrongThemeEls,
  ThemeProvider,
  useTheme,
} from './utils/theme-provider'
import { getThemeSession } from './utils/theme.server'

export function links() {
  return [
    { rel: 'preconnect', href: 'https://rsms.me' },
    { rel: 'stylesheet', href: 'https://rsms.me/inter/inter.css' },
    { rel: 'stylesheet', href: styles },
  ]
}

export async function loader({ request }: DataFunctionArgs) {
  const themeSession = await getThemeSession(request)

  return json({ theme: themeSession.getTheme() })
}

function App() {
  const [theme] = useTheme()
  const data = useLoaderData<typeof loader>()

  return (
    <html lang="en" className={clsx(theme)}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
        <NonFlashOfWrongThemeEls ssrTheme={Boolean(data.theme)} />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}

export default function AppWithProviders() {
  const data = useLoaderData<typeof loader>()

  return (
    <ThemeProvider specifiedTheme={data.theme}>
      <App />
    </ThemeProvider>
  )
}
