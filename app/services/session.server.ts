import { createCookieSessionStorage } from '@remix-run/node'
import invariant from 'tiny-invariant'

const { SESSION_SECRET } = process.env
invariant(typeof SESSION_SECRET === 'string', 'SESSION_SECRET env var not set')

// export the whole sessionStorage object
export let sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '_session', // use any name you want here
    sameSite: 'lax', // this helps with CSRF
    path: '/', // remember to add this so the cookie will work in all routes
    httpOnly: true, // for security reasons, make this cookie http only
    secrets: [SESSION_SECRET], // replace this with an actual secret
    secure: process.env.NODE_ENV === 'production', // enable this in prod only
  },
})

// you can also export the methods individually for your own usage
export let { getSession, commitSession, destroySession } = sessionStorage
