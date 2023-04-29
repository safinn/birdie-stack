const { execSync } = require('child_process')
const crypto = require('crypto')
const fs = require('fs/promises')
const path = require('path')

const PackageJson = require('@npmcli/package-json')
const semver = require('semver')
const YAML = require('yaml')

const cleanupDeployWorkflow = (deployWorkflow, deployWorkflowPath) => {
  delete deployWorkflow.jobs.typecheck
  deployWorkflow.jobs.deploy.needs = deployWorkflow.jobs.deploy.needs.filter(
    (need) => need !== 'typecheck'
  )

  return [fs.writeFile(deployWorkflowPath, YAML.stringify(deployWorkflow))]
}

const escapeRegExp = (string) =>
  // $& means the whole matched string
  string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const getPackageManagerCommand = (packageManager) =>
  // Inspired by https://github.com/nrwl/nx/blob/bd9b33eaef0393d01f747ea9a2ac5d2ca1fb87c6/packages/nx/src/utils/package-manager.ts#L38-L103
  ({
    npm: () => ({
      exec: 'npx',
      lockfile: 'package-lock.json',
      run: (script, args) => `npm run ${script} ${args ? `-- ${args}` : ''}`,
    }),
    pnpm: () => {
      const pnpmVersion = getPackageManagerVersion('pnpm')
      const includeDoubleDashBeforeArgs = semver.lt(pnpmVersion, '7.0.0')
      const useExec = semver.gte(pnpmVersion, '6.13.0')

      return {
        exec: useExec ? 'pnpm exec' : 'pnpx',
        lockfile: 'pnpm-lock.yaml',
        run: (script, args) =>
          includeDoubleDashBeforeArgs
            ? `pnpm run ${script} ${args ? `-- ${args}` : ''}`
            : `pnpm run ${script} ${args || ''}`,
      }
    },
    yarn: () => ({
      exec: 'yarn',
      lockfile: 'yarn.lock',
      run: (script, args) => `yarn ${script} ${args || ''}`,
    }),
  }[packageManager]())

const getPackageManagerVersion = (packageManager) =>
  // Copied over from https://github.com/nrwl/nx/blob/bd9b33eaef0393d01f747ea9a2ac5d2ca1fb87c6/packages/nx/src/utils/package-manager.ts#L105-L114
  execSync(`${packageManager} --version`).toString('utf-8').trim()

const getRandomString = (length) => crypto.randomBytes(length).toString('hex')

const readFileIfNotTypeScript = (
  isTypeScript,
  filePath,
  parseFunction = (result) => result
) =>
  isTypeScript
    ? Promise.resolve()
    : fs.readFile(filePath, 'utf-8').then(parseFunction)

const removeUnusedDependencies = (dependencies, unusedDependencies) =>
  Object.fromEntries(
    Object.entries(dependencies).filter(
      ([key]) => !unusedDependencies.includes(key)
    )
  )

const updatePackageJson = ({ APP_NAME, isTypeScript, packageJson }) => {
  const {
    scripts: { typecheck, validate, ...scripts },
  } = packageJson.content

  packageJson.update({
    name: APP_NAME,
    scripts: isTypeScript ? { ...scripts, typecheck } : { ...scripts },
  })
}

const main = async ({ isTypeScript, packageManager, rootDirectory }) => {
  const pm = getPackageManagerCommand(packageManager)

  const README_PATH = path.join(rootDirectory, 'README.md')
  const EXAMPLE_ENV_PATH = path.join(rootDirectory, '.env.example')
  const ENV_PATH = path.join(rootDirectory, '.env')
  const DEPLOY_WORKFLOW_PATH = path.join(
    rootDirectory,
    '.github',
    'workflows',
    'deploy.yml'
  )
  const DOCKERFILE_PATH = path.join(rootDirectory, 'Dockerfile')
  const TERRAFORM_ENVS_PATH = path.join(
    rootDirectory,
    'infra',
    'prod',
    'terraform.tfvars'
  )
  const TERRAFORM_PATH = path.join(
    rootDirectory,
    'infra',
    'prod',
    'terraform.tf'
  )

  const REPLACER = 'birdie-stack'

  const DIR_NAME = path.basename(rootDirectory)

  const APP_NAME = DIR_NAME
    // get rid of anything that's not allowed in an app name
    .replace(/[^a-zA-Z0-9-_]/g, '-')

  const [readme, env, dockerfile, tfvars, tf, deployWorkflow, packageJson] =
    await Promise.all([
      fs.readFile(README_PATH, 'utf-8'),
      fs.readFile(EXAMPLE_ENV_PATH, 'utf-8'),
      fs.readFile(DOCKERFILE_PATH, 'utf-8'),
      fs.readFile(TERRAFORM_ENVS_PATH, 'utf-8'),
      fs.readFile(TERRAFORM_PATH, 'utf-8'),
      fs.readFile(DEPLOY_WORKFLOW_PATH, 'utf-8'),
      PackageJson.load(rootDirectory),
    ])

  const newEnv = env
    .replace(/^SESSION_SECRET=.*$/m, `SESSION_SECRET="${getRandomString(16)}"`)
    .replace(/^OTP_SECRET=.*$/m, `OTP_SECRET="${getRandomString(16)}"`)
    .replace(/^APP_NAME=.*$/m, `APP_NAME="${APP_NAME}"`)
    .replace(/^ORIGINAL_APP_NAME=.*$/m, `ORIGINAL_APP_NAME="${APP_NAME}"`)

  const newReadme = readme.replace(
    new RegExp(escapeRegExp(REPLACER), 'g'),
    APP_NAME
  )

  const newTfvars = tfvars.replace(
    new RegExp(escapeRegExp(REPLACER), 'g'),
    APP_NAME
  )

  const newTf = tf.replace(new RegExp(escapeRegExp(REPLACER), 'g'), APP_NAME)

  const newDeployWorkflow = deployWorkflow.replace(
    new RegExp(escapeRegExp(REPLACER), 'g'),
    APP_NAME
  )

  const newDockerfile = pm.lockfile
    ? dockerfile.replace(
        new RegExp(escapeRegExp('ADD package.json'), 'g'),
        `ADD package.json ${pm.lockfile}`
      )
    : dockerfile

  updatePackageJson({ APP_NAME, isTypeScript, packageJson })

  const fileOperationPromises = [
    fs.writeFile(README_PATH, newReadme),
    fs.writeFile(ENV_PATH, newEnv),
    fs.writeFile(DOCKERFILE_PATH, newDockerfile),
    fs.writeFile(TERRAFORM_ENVS_PATH, newTfvars),
    fs.writeFile(TERRAFORM_PATH, newTf),
    fs.writeFile(DEPLOY_WORKFLOW_PATH, newDeployWorkflow),
    packageJson.save(),
    fs.copyFile(
      path.join(rootDirectory, 'remix.init', 'gitignore'),
      path.join(rootDirectory, '.gitignore')
    ),
    fs.rm(path.join(rootDirectory, '.github', 'dependabot.yml')),
  ]

  if (!isTypeScript) {
    const parsedDeployWorkflow = YAML.parse(newDeployWorkflow)
    fileOperationPromises.push(
      ...cleanupDeployWorkflow(parsedDeployWorkflow, DEPLOY_WORKFLOW_PATH)
    )
  }

  await Promise.all(fileOperationPromises)

  execSync(pm.run('format', '--loglevel warn'), {
    cwd: rootDirectory,
    stdio: 'inherit',
  })

  console.log(
    `Setup is complete. You're now ready to rock and roll 🤘
Start development with \`${pm.run('dev')}\`
    `.trim()
  )
}

module.exports = main
