#!/usr/bin/env node
const path = require('path')
const fs = require('fs')
const yargs = require('yargs')
const hasYarn = require('has-yarn')()

const ora = require('ora')
const execa = require('execa')

const { log } = require('@eliasnorrby/log-util')

const pkgInstall = hasYarn ? 'yarn add' : 'npm install'
const pkgInstallDev = `${pkgInstall} -D`

yargs
  .alias('v', 'version')
  .usage('Usage: $0 [options]')
  .help('h')
  .alias('h', 'help')
  .option('i', {
    describe: 'Install this package',
    type: 'boolean',
    alias: 'install',
    default: true,
  })
  .describe('no-install', 'Skip installing this package')
  .strict(true)

const argv = yargs.argv

const packageName = '@eliasnorrby/commitlint-config'

if (!fs.existsSync('package.json')) {
  log.fail(
    'No package.json found in the current directory. Make sure you are in the project root. If no package.json exists yet, run `npm init` first.'
  )
  process.exit(1)
}

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
const husky = packageJson.husky

const hooksDefined = Boolean(husky && husky.hooks)
const msghookDefined = Boolean(hooksDefined && husky.hooks['commit-msg'])

if (msghookDefined) {
  log.skip(`commit-msg hook already configured: ${husky.hooks['commit-msg']}`)
} else {
  const newHusky = {
    hooks: {
      'commit-msg': 'commitlint -E HUSKY_GIT_PARAMS',
    },
  }
  if (husky && hooksDefined) {
    newHusky.hooks = { ...husky.hooks, ...newHusky.hooks }
  }
  packageJson.husky = newHusky
  log.info('Added commitlint to git hook')
  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2))
  log.info('package.json saved')
}

const config = argv.install
  ? `\
module.exports = {
  extends: ["@eliasnorrby/commitlint-config"],
  // Override rules here
};
`
  : `\
module.exports = {
  extends: ["@commitlint/config-conventional"],
  // Add rules here
}
`

if (!fs.existsSync('commitlint.config.js'))
  fs.writeFileSync('commitlint.config.js', config, 'utf8')

const gitmessage = fs.readFileSync(
  path.resolve(__dirname, '.gitmessage'),
  'utf8'
)

fs.writeFileSync('.gitmessage', gitmessage, 'utf8')

log.info('Setting local git commit message template')
require('child_process').execSync('git config commit.template .gitmessage', {
  stdio: 'inherit',
})

const spinner = ora({
  text: 'Installing...',
  spinner: 'growHorizontal',
  color: 'blue',
})

const runCommand = async (cmd) => {
  try {
    spinner.start()
    await execa.command(cmd)
    spinner.stop()
  } catch (error) {
    spinner.stop()
    log.fail(error)
    process.exit(1)
  }
}

;(async () => {
  log.info('Installing peer dependencies (@commitlint/cli, husky)')
  await runCommand(`${pkgInstallDev} @commitlint/cli husky`)

  if (argv.install) {
    log.info(`Installing self (${packageName})`)
    await runCommand(`${pkgInstallDev} ${packageName}`)
  } else {
    log.skip('Skipping install of self')
    const baseConfig = '@commitlint/config-conventional'
    log.info(`Installing conventional config (${baseConfig})`)
    await runCommand(`${pkgInstallDev} ${baseConfig}`)
  }

  log.ok('Done!')
})()
