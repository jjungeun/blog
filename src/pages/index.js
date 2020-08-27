import React from "react"
import { graphql, StaticQuery } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"
import TechTag from "../components/techtag"
import ArchiveBlock from "../components/archiveBlock"

import "../utils/normalize.css"
import "../utils/css/screen.css"

const BlogIndex = ({ data }, location) => {
  const siteTitle = data.site.siteMetadata.title
  const labels = data.site.siteMetadata.labels

  const getTechTags = () => {
    const techTags = []
    labels.forEach(label => {
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
    })
    return techTags
  }

  return (
    <Layout title={siteTitle}>
      <SEO
        title="All posts"
        keywords={[`blog`, `gatsby`, `javascript`, `react`]}
      />
      {data.site.siteMetadata.description && (
        <header className="page-head">
          <h2 className="page-head-title">
            {data.site.siteMetadata.description}
          </h2>
        </header>
      )}
      {data.site.siteMetadata.labels && (
        <div className="tag-block">{getTechTags()}</div>
      )}
      <ArchiveBlock data={data} />
    </Layout>
  )
}

const indexQuery = graphql`
  query {
    site {
      siteMetadata {
        title
        description
        labels {
          tag
          tech
          svg
          size
          color
        }
      }
    }
    allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }) {
      edges {
        node {
          excerpt
          fields {
            slug
          }
          frontmatter {
            date(formatString: "YYYY-MM-DD")
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
          fields {
            slug
          }
        }
      }
    }
  }
`

export default props => (
  <StaticQuery
    query={indexQuery}
    render={data => (
      <BlogIndex location={props.location} props data={data} {...props} />
    )}
  />
)
