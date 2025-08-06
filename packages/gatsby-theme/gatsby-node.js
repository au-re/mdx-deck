// based on gatsby-theme-blog
import fs from 'fs'
import path from 'path'
import mkdirp from 'mkdirp'
import Debug from 'debug'
import { createRequire } from 'module'
import pkg from './package.json' with { type: 'json' }

const require = createRequire(import.meta.url)

const debug = Debug(pkg.name)

let basePath
let contentPath

const DeckTemplate = require.resolve(`./src/templates/deck`)
const DecksTemplate = require.resolve(`./src/templates/decks`)

export const onPreBootstrap = ({ store }, opts = {}) => {
  const { program } = store.getState()

  basePath = opts.basePath || `/`
  contentPath = opts.contentPath || `decks`

  if (opts.cli) return
  const dirname = path.join(program.directory, contentPath)
  mkdirp.sync(dirname)

  debug(`Initializing ${dirname} directory`)
}

const mdxResolverPassthrough =
  (fieldName) => async (source, args, context, info) => {
    const type = info.schema.getType(`Mdx`)
    const mdxNode = context.nodeModel.getNodeById({
      id: source.parent,
    })
    const resolver = type.getFields()[fieldName]?.resolve
    if (!resolver) return null
    const result = await resolver(mdxNode, args, context, {
      fieldName,
    })
    return result
  }

const resolveTitle = async (...args) => {
  const headings = (await mdxResolverPassthrough('headings')(...args)) || []
  const [first = {}] = headings
  return first.value || ''
}

export const createSchemaCustomization = ({ actions, schema }) => {
  actions.createTypes(
    schema.buildObjectType({
      name: `Deck`,
      fields: {
        id: { type: `ID!` },
        slug: {
          type: `String!`,
        },
        title: {
          type: 'String!',
          resolve: resolveTitle,
        },
        body: {
          type: `String!`,
          resolve: mdxResolverPassthrough(`body`),
        },
      },
      interfaces: [`Node`],
    })
  )
}

export const createPages = async ({
  graphql,
  actions,
  reporter,
  pathPrefix,
}) => {
  const { createPage } = actions

  const result = await graphql(`
    {
      allDeck {
        edges {
          node {
            id
            slug
            title
          }
        }
      }
    }
  `)

  if (result.errors) {
    reporter.panic(result.errors)
  }

  const { allDeck } = result.data
  const decks = allDeck.edges

  // single deck mode
  if (decks.length === 1) {
    const [deck] = decks
    const base = basePath === '/' ? '' : basePath
    const matchPath = [base, '*'].join('/')

    const slug = [pathPrefix, base].filter(Boolean).join('')

    createPage({
      path: basePath,
      matchPath,
      component: DeckTemplate,
      context: {
        ...deck.node,
        slug,
      },
    })
    createPage({
      path: base + '/print',
      component: DeckTemplate,
      context: {
        ...deck.node,
        slug,
      },
    })
    return
  }

  decks.forEach(({ node }, index) => {
    const matchPath = [node.slug, '*'].join('/')
    const slug = [pathPrefix, node.slug].filter(Boolean).join('')

    createPage({
      path: node.slug,
      matchPath,
      component: DeckTemplate,
      context: {
        ...node,
        slug,
      },
    })
    createPage({
      path: slug + '/print',
      component: DeckTemplate,
      context: {
        ...node,
        slug,
      },
    })
  })

  // index page
  createPage({
    path: basePath,
    component: DecksTemplate,
    context: {
      decks,
    },
  })
}

export const onCreateNode = ({
  node,
  actions,
  getNode,
  createNodeId,
  createContentDigest,
}) => {
  const { createNode, createParentChildLink } = actions

  const toPath = (node) => {
    const { dir } = path.posix.parse(node.relativePath)
    return path.posix.join(basePath, dir, node.name)
  }

  if (node.internal.type !== `Mdx`) return

  const fileNode = getNode(node.parent)
  const source = fileNode.sourceInstanceName

  if (node.internal.type !== `Mdx` || source !== contentPath) return

  const slug = toPath(fileNode)
  const id = createNodeId(`${node.id} >>> Deck`)

  createNode({
    slug,
    // Required fields.
    id,
    parent: node.id,
    children: [],
    internal: {
      type: `Deck`,
      contentDigest: node.internal.contentDigest,
      content: node.internal.content || '',
      description: `Slide Decks`,
    },
  })
  createParentChildLink({ parent: fileNode, child: getNode(id) })
}

export const onCreateDevServer = ({ app }) => {
  if (typeof process.send !== 'function') return
  process.send({
    mdxDeck: true,
  })
}
