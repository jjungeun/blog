const path = require(`path`)
const _ = require("lodash")
const { createFilePath } = require(`gatsby-source-filesystem`)

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions

  const blogPost = path.resolve(`./src/templates/blog-post.js`)
  return graphql(
    `
      {
        allMarkdownRemark(
          sort: { fields: [frontmatter___date], order: DESC }
          limit: 2000
        ) {
          edges {
            node {
              fields {
                slug
              }
              frontmatter {
                title
                tags
              }
            }
          }
        }
        allDirectory(
          filter: { dir: { regex: "/content/blog//" }, name: { ne: "img" } }
        ) {
          group(field: dir) {
            fieldValue
            nodes {
              name
              dir
              absolutePath
            }
          }
        }
      }
    `
  ).then(result => {
    if (result.errors) {
      throw result.errors
    }

    const posts = result.data.allMarkdownRemark.edges
    // Create blog posts pages.
    posts.forEach((post, index) => {
      const previous = index === posts.length - 1 ? null : posts[index + 1].node
      const next = index === 0 ? null : posts[index - 1].node

      createPage({
        path: post.node.fields.slug,
        component: blogPost,
        context: {
          slug: post.node.fields.slug,
          previous,
          next,
        },
      })
    })

    // Create category pages.
    const categories = result.data.allDirectory.group
    categories.forEach(category => {
      const categoryPath = category.fieldValue.split("/")
      const categoryName = categoryPath[categoryPath.length - 1]
      createPage({
        path: `/category/${categoryName}/`,
        component: path.resolve("src/templates/category-post.js"),
        context: {
          categoryName: categoryName,
          categoryReg: `/${categoryName}/`,
        },
      })
    })

    // Create tag pages.
    let tags = []
    _.each(posts, edge => {
      if (_.get(edge, "node.frontmatter.tags")) {
        tags = tags.concat(edge.node.frontmatter.tags)
      }
    })
    // Eliminate duplicate tags
    tags = _.uniq(tags)
    // Make tag pages
    tags.forEach(tag => {
      createPage({
        path: `/tags/${_.kebabCase(tag)}/`,
        component: path.resolve("src/templates/tag.js"),
        context: {
          tag,
        },
      })
    })
  })
}

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions

  if (node.internal.type === `MarkdownRemark`) {
    const value = createFilePath({ node, getNode })
    createNodeField({
      name: `slug`,
      node,
      value,
    })
  }
}
