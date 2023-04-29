import * as fs from 'node:fs'
import chokidar from 'chokidar'
import express from 'express'
import compression from 'compression'
import morgan from 'morgan'
import { createRequestHandler } from '@remix-run/express'
import { broadcastDevReady, installGlobals } from '@remix-run/node'
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager'
import invariant from 'tiny-invariant'

async function fetchSecrets() {
  // Fetch DB password
  if (!process.env.DATABASE_PASSWORD) {
    let { AWS_REGION, ENV, APP_NAME } = process.env
    invariant(AWS_REGION, 'AWS_REGION must be set')
    invariant(ENV, 'ENV env var not set')
    invariant(APP_NAME, 'APP_NAME env var not set')

    const client = new SecretsManagerClient({ region: AWS_REGION })

    const command = new GetSecretValueCommand({
      SecretId: `${ENV}-${APP_NAME}-rds-password`,
    })

    const res = await client.send(command)
    process.env.DATABASE_PASSWORD = res.SecretString
  }
}

await fetchSecrets()

// eslint-disable-next-line import/first
const build = await import('./build/index.js')

const BUILD_PATH = './build/index.js'

installGlobals()

const app = express()

app.use(compression())

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable('x-powered-by')

// Remix fingerprints its assets so we can cache forever.
app.use(
  '/build',
  express.static('public/build', { immutable: true, maxAge: '1y' })
)

// Everything else (like favicon.ico) is cached for an hour. You may want to be
// more aggressive with this caching.
app.use(express.static('public', { maxAge: '1h' }))

app.use(morgan('tiny'))

app.all(
  '*',
  process.env.NODE_ENV === 'development'
    ? createDevRequestHandler()
    : createRequestHandler({
        build,
        mode: process.env.NODE_ENV,
      })
)

const port = process.env.PORT || 3000
const server = app.listen(port, async () => {
  console.log(`Express server listening on port ${port}`)

  if (process.env.NODE_ENV === 'development') {
    broadcastDevReady(build)
  }
})

process.on('SIGTERM', () => {
  console.info('SIGTERM signal received')
  console.log('Closing http server')
  server.close(async () => {
    console.log('Http server closed')
    process.exit(0)
  })
})

function createDevRequestHandler() {
  // initial build
  /**
   * @type { import('@remix-run/node').ServerBuild | Promise<import('@remix-run/node').ServerBuild> }
   */
  let devBuild = build

  const watcher = chokidar.watch(BUILD_PATH, { ignoreInitial: true })

  watcher.on('all', async () => {
    // 1. purge require cache && load updated server build
    const stat = fs.statSync(BUILD_PATH)
    devBuild = import(BUILD_PATH + '?t=' + stat.mtimeMs)
    // 2. tell dev server that this app server is now ready
    broadcastDevReady(await devBuild)
  })

  return async (req, res, next) => {
    try {
      //
      return createRequestHandler({
        build: await devBuild,
        mode: 'development',
      })(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}
