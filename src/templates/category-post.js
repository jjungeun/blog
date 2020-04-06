import React from "react"
import PropTypes from "prop-types"
import { Link, graphql } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"
import TechTag from "../components/techtag"

const Category = ({ pageContext, data }) => {
  const siteTitle = data.site.siteMetadata.title
  const posts = data.allMarkdownRemark.edges
  const labels = data.site.siteMetadata.labels
  const { categoryName } = pageContext
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
      <div className="category-block">
        <h2>{categoryName}</h2>
        {posts.map((post, id) => {
          const tags = post.node.frontmatter.tags
          return (
            <div key={id} className="container mt-5">
              <li>
                <Link to={post.node.fields.slug}>
                  <strong style={{ fontSize: "x-large" }}>
                    {post.node.frontmatter.title}
                  </strong>
                  <p className="mt-3 d-inline" style={{ color: "black" }}>
                    {post.node.excerpt}
                  </p>
                </Link>
                <small className="d-block text-info">
                  Posted on {post.node.frontmatter.date}
                </small>
                <div className="d-block">{getTechTags(tags)}</div>
              </li>
            </div>
          )
        })}
      </div>
    </Layout>
  )
}

Category.propTypes = {
  pageContext: PropTypes.shape({
    categoryName: PropTypes.string.isRequired,
    categoryReg: PropTypes.string.isRequired,
  }),
}

export const pageQuery = graphql`
  query($categoryReg: String) {
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
      filter: { fields: { slug: { regex: $categoryReg } } }
    ) {
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
          }
        }
      }
    }
  }
`

export default Category
