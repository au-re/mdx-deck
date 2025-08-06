module.exports = {
  pathPrefix: '/mdx-deck',
  plugins: [
    'gatsby-plugin-catch-links',
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        path: `${__dirname}/src/pages`,
        name: 'pages',
      },
    },
    {
      resolve: 'gatsby-theme-mdx-deck',
      options: {
        basePath: '/slides',
      },
    },
  ],
}
