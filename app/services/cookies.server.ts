import { createCookie } from '@remix-run/node'

export const redirectToCookie = createCookie('redirect-to', {
  path: '/',
  httpOnly: true,
  sameSite: 'lax',
  maxAge: 60, // 1 minute because it makes no sense to keep it for a long time
  secure: process.env.NODE_ENV === 'production',
})

export const invitiationCookie = createCookie('invite', {
  path: '/',
  httpOnly: true,
  sameSite: 'lax',
  maxAge: 60 * 60 * 24 * 7, // 7 days
  secure: process.env.NODE_ENV === 'production',
})
