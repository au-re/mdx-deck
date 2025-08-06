#!/usr/bin/env node
import generatePdf from './index.js'
import { createRequire } from 'module'

const cjs = createRequire(import.meta.url)
const meow = cjs('meow')

const cli = meow(
  `
  Usage:

    $ website-pdf http://example.com

  Options:

    -o --out-file   Output filename
    -w --width      Width in pixels
    -h --height     Height in pixels
    --no-sandbox    Disable puppeteer sandbox

`,
  {
    flags: {
      outFile: {
        type: 'string',
        alias: 'o',
        default: 'website.pdf',
      },
      width: {
        type: 'string',
        alias: 'w',
        default: '1280',
      },
      height: {
        type: 'string',
        alias: 'h',
        default: '960',
      },
      sandbox: {
        type: 'boolean',
        default: true,
      },
    },
  }
)

const [url] = cli.input

if (!url) {
  cli.showHelp(0)
}

const opts = Object.assign({}, cli.flags, {
  url,
})

generatePdf(opts)
  .then(filename => {
    console.log(`saved PDF to`, filename)
    process.exit(0)
  })
  .catch(err => {
    console.log(err)
    process.exit(1)
  })
