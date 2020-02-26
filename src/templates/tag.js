import React from "react"
import PropTypes from "prop-types"
import { Link, graphql } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"
import TechTag from "../components/techtag"

const Tag = ({ pageContext, data }) => {
  const siteTitle = data.site.siteMetadata.title
  const posts = data.allMarkdownRemark.edges
  const labels = data.site.siteMetadata.labels
  const { tag } = pageContext
  const { totalCount } = data.allMarkdownRemark
  const tagHeader = `${totalCount} post${
    totalCount === 1 ? "" : "s"
  } tagged with "${tag}"`

  const getTechTags = tags => {
    const techTags = []
    tags.forEach((tag, i) => {
      labels.forEach(label => {
        if (tag === label.tag) {
          techTags.push(
            <TechTag
              key={label.tag}
              tag={label.tag}
              tech={label.tech}
              svg={label.svg}
              size={label.size}
              color={label.color}
            />
          )
        }
      })
    })
    return techTags
  }

  return (
    <Layout title={siteTitle}>
      <SEO
        title="Home"
        keywords={[
          `gatsby`,
          `javascript`,
          `react`,
          `web development`,
          `node.js`,
          `graphql`,
        ]}
      />
      <div className="index-main">
        <div className="post-list-main">
          <i>
            <h2 className="heading">{tagHeader}</h2>
          </i>
          {posts.map(post => {
            const tags = post.node.frontmatter.tags
            return (
              <div key={post.node.id} className="container mt-5">
                <Link to={post.node.fields.slug} className="text-dark">
                  <h2 className="heading">{post.node.frontmatter.title}</h2>
                </Link>
                <small className="d-block text-info">
                  Posted on {post.node.frontmatter.date}
                </small>
                <p className="mt-3 d-inline">
                  {post.node.excerpt}
                  <Link to={post.node.fields.slug} className="text-primary">
                    <small className="d-inline-block ml-3">
                      {" "}
                      Read full post
                    </small>
                  </Link>
                </p>
                <div className="d-block">{getTechTags(tags)}</div>
              </div>
            )
          })}
        </div>
      </div>
    </Layout>
  )
}

Tag.propTypes = {
  pageContext: PropTypes.shape({
    tag: PropTypes.string.isRequired,
  }),
  data: PropTypes.shape({
    allMarkdownRemark: PropTypes.shape({
      totalCount: PropTypes.number.isRequired,
      edges: PropTypes.arrayOf(
        PropTypes.shape({
          node: PropTypes.shape({
            frontmatter: PropTypes.shape({
              title: PropTypes.string.isRequired,
            }),
          }),
        }).isRequired
      ),
    }),
  }),
}

export const pageQuery = graphql`
  query($tag: String) {
    site {
      siteMetadata {
        title
        author
        labels {
          tag
          tech
          svg
          size
          color
        }
      }
    }
    allMarkdownRemark(
      limit: 2000
      sort: { fields: [frontmatter___date], order: DESC }
      filter: { frontmatter: { tags: { in: [$tag] } } }
    ) {
      totalCount
      edges {
        node {
          excerpt(pruneLength: 200)
          fields {
            slug
          }
          frontmatter {
            date(formatString: "MMMM, YYYY")
            title
            descripttion
            tags
            thumbnail {
              childImageSharp {
                fluid(maxWidth: 1360) {
                  ...GatsbyImageSharpFluid
                }
              }
            }
          }
        }
      }
    }
  }
`

export default Tag
