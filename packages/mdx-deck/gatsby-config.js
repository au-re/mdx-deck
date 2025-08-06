import path from 'path'

const src = process.env.__SRC__
const dirname = path.dirname(src)

export default {
  plugins: [
    {
      resolve: '@mdx-deck/gatsby-plugin',
      options: {
        path: src,
        dirname,
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        path: dirname,
        ignore: [
          'node_modules',
          'public',
          '.cache',
        ]
      },
    },
    {
      resolve: 'gatsby-plugin-compile-es6-packages',
      options: {
        modules: ['mdx-deck', '@mdx-deck/themes'],
      },
    },
  ],
}
