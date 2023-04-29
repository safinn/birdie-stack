import type { V2_MetaFunction } from '@remix-run/node'
import { Theme, useTheme } from '~/utils/theme-provider'

export const meta: V2_MetaFunction = () => {
  return [{ title: 'New Birdie-Stack Remix App' }]
}

export default function Index() {
  const [, setTheme] = useTheme()

  const toggleTheme = () => {
    setTheme((prevTheme) =>
      prevTheme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT
    )
  }

  return (
    <div>
      <button onClick={toggleTheme}>Toggle Theme</button>
      <h1>Welcome to the Remix Birdie Stack</h1>
      <ul>
        <li>Dark mode</li>
        <li>
          Authentication with{' '}
          <a href="https://github.com/sergiodxa/remix-auth">remix-auth</a> and{' '}
          <a href="https://github.com/dev-xo/remix-auth-otp">Remix Auth OTP</a>
        </li>
        <li>
          Emails created with{' '}
          <a href="https://github.com/resendlabs/react-email">React Email</a>{' '}
          and sent with <a href="https://aws.amazon.com/ses/">AWS SES</a>
        </li>
        <li>
          Database with{' '}
          <a href="https://github.com/porsager/postgres">Postgres.js</a>
        </li>
        <li>
          Styling with <a href="https://tailwindcss.com/">Tailwind</a>
        </li>
        <li>
          Code formatting with <a href="https://prettier.io/">Prettier</a>
        </li>
        <li>
          Linting with <a href="https://eslint.org/">ESLint</a>
        </li>
        <li>
          Static Types with <a href="https://typescriptlang.org/">TypeScript</a>
        </li>
      </ul>
    </div>
  )
}
