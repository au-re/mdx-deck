import fs from 'fs'
import path from 'path'
import remarkImages from 'remark-images'
import remarkUnwrapImages from 'remark-unwrap-images'
import remarkEmoji from 'remark-emoji'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const remarkPlugins = [
  remarkImages,
  remarkUnwrapImages,
  remarkEmoji,
]

export const onPreBootstrap = ({}, opts = {}) => {
  opts.dirname = opts.dirname || __dirname
  const staticSourceDir = path.join(opts.dirname, 'static')
  const hasStaticDir = fs.existsSync(staticSourceDir)

  if (fs.existsSync('./static')) {
    // remove temp directory
    fs.unlinkSync('./static')
  }

  if (hasStaticDir) {
    // link to source static directory
    fs.symlinkSync(staticSourceDir, './static')
  }
}

export const onCreateWebpackConfig = ({
  stage,
  rules,
  loaders,
  plugins,
  actions,
}) => {
  actions.setWebpackConfig({
    module: {
      rules: [
        {
          test: /\.mdx$/,
          use: [
            loaders.js(),
            {
              loader: '@mdx-js/loader',
              options: {
                remarkPlugins,
              }
            },
          ]
        }
      ]
    }
  })
}

export const resolvableExtensions = () => ['.mdx']

export const createPages = ({
  actions,
}, {
  path: source,
} = {}) => {
  if (!source) return

  actions.createPage({
    path: '/',
    matchPath: '/*',
    component: source,
  })
}
