#!/usr/bin/env node
import path from 'path'
import execa from 'execa'
import chalk from 'chalk'
import fs from 'fs-extra'
import pkg from './package.json' with { type: 'json' }
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

const cjs = createRequire(import.meta.url)
const meow = cjs('meow')

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const log = (...args) => {
  console.log(chalk.green('[mdx-deck]'), ...args)
}
log.error = (...args) => {
  console.log(chalk.red('[err]'), ...args)
}

const cli = meow(
  `
  ${chalk.gray('Usage')}

    $ ${chalk.green('mdx-deck deck.mdx')}

    $ ${chalk.green('mdx-deck build deck.mdx')}

  ${chalk.gray('Options')}

      -h --host     Dev server host
      -p --port     Dev server port
      --no-open     Prevent from opening in default browser

`,
  {
    description: chalk.green('@mdx-deck/lite ') + chalk.gray(pkg.description),
    flags: {
      port: {
        type: 'string',
        alias: 'p',
        default: '8000',
      },
      host: {
        type: 'string',
        alias: 'h',
        default: 'localhost',
      },
      open: {
        type: 'boolean',
        alias: 'o',
        default: true,
      },
    },
  }
)

const [cmd, file] = cli.input
const filename = file || cmd

if (!filename) cli.showHelp(0)

process.env.__SRC__ = path.resolve(filename)

const opts = Object.assign({}, cli.flags)

let dev

const gatsby = async (...args) => {
  await execa('gatsby', ['clean'], {
    cwd: __dirname,
    stdio: 'inherit',
    preferLocal: true,
  })
  return execa('gatsby', args.filter(Boolean), {
    cwd: __dirname,
    stdio: 'inherit',
    preferLocal: true,
  })
}

switch (cmd) {
  case 'build':
    gatsby('build').then(() => {
      const publicDir = path.join(__dirname, 'public')
      const dist = path.join(process.cwd(), 'public')
      if (publicDir === dist) return
      fs.copySync(publicDir, dist)
    })
    break
  case 'dev':
  default:
    gatsby(
      'develop',
      '--host',
      opts.host,
      '--port',
      opts.port,
      opts.open && '--open'
    )
    break
}
