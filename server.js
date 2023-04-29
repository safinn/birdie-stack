const path = require('node:path')
const express = require('express')
const compression = require('compression')
const morgan = require('morgan')

const { createRequestHandler } = require('@remix-run/express')
const {
  SecretsManagerClient,
  GetSecretValueCommand,
} = require('@aws-sdk/client-secrets-manager')
const invariant = require('tiny-invariant')

const BUILD_DIR = path.join(process.cwd(), 'build')

function purgeRequireCache() {
  // purge require cache on requests for "server side HMR" this won't let
  // you have in-memory objects between requests in development,
  // alternatively you can set up nodemon/pm2-dev to restart the server on
  // file changes, but then you'll have to reconnect to databases/etc on each
  // change. We prefer the DX of this, so we've included it for you by default
  for (const key in require.cache) {
    if (key.startsWith(BUILD_DIR)) {
      delete require.cache[key]
    }
  }
}

async function fetchSecrets() {
  // Fetch DB password
  if (!process.env.DATABASE_PASSWORD) {
    let { AWS_REGION, ENV, NAME } = process.env
    invariant(AWS_REGION, 'AWS_REGION must be set')
    invariant(typeof ENV === 'string', 'ENV env var not set')
    invariant(typeof NAME === 'string', 'NAME env var not set')

    const client = new SecretsManagerClient({ region: AWS_REGION })
    const command = new GetSecretValueCommand({
      SecretId: `${ENV}-${NAME}-rds-password`,
    })

    const res = await client.send(command)
    console.log(res)
    process.env.DATABASE_PASSWORD = res.SecretString
  }
}

async function main() {
  await fetchSecrets()

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
      ? (req, res, next) => {
          purgeRequireCache()

          return createRequestHandler({
            build: require(BUILD_DIR),
            mode: process.env.NODE_ENV,
          })(req, res, next)
        }
      : createRequestHandler({
          build: require(BUILD_DIR),
          mode: process.env.NODE_ENV,
        })
  )
  const port = process.env.PORT || 3000

  app.listen(port, () => {
    console.log(`Express server listening on port ${port}`)
  })
}

main()
