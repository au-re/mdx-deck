import remarkUnwrapImages from 'remark-unwrap-images'
import remarkEmoji from 'remark-emoji'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const IS_LOCAL = process.cwd() === __dirname

const remarkPlugins = [remarkUnwrapImages, remarkEmoji]
const gatsbyRemarkPlugins = [`gatsby-remark-import-code`]

const config = (opts = {}) => {
  const { mdx = true, contentPath: name = 'decks' } = opts

  return {
    plugins: [
      {
        resolve: 'gatsby-source-filesystem',
        options: {
          name,
          path: name,
        },
      },
      mdx && {
        resolve: 'gatsby-plugin-mdx',
        options: {
          gatsbyRemarkPlugins,
          remarkPlugins,
        },
      },
      'gatsby-plugin-react-helmet',
      'gatsby-plugin-emotion',
      'gatsby-plugin-catch-links',
      'gatsby-plugin-theme-ui',
      {
        resolve: 'gatsby-plugin-compile-es6-packages',
        options: {
          modules: ['@mdx-deck/themes'],
        },
      },
    ].filter(Boolean),
  }
}

export default IS_LOCAL ? config() : config
