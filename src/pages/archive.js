import React from "react"
import { graphql, StaticQuery } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"
import ArchiveBlock from "../components/archiveBlock"

import "../utils/normalize.css"
import "../utils/css/screen.css"

const ArchivesPage = ({ data }, location) => {
  const siteTitle = data.site.siteMetadata.title
  const edges = data.allMarkdownRemark.edges
  const yearDict = {}
  edges.forEach(edge => {
    var year = edge.node.frontmatter.date.split("-")[0] + " "
    if (yearDict[year]) {
      yearDict[year].push(edge.node)
    } else {
      yearDict[year] = [edge.node]
    }
  })

  return (
    <Layout title={siteTitle}>
      <SEO
        title="All posts"
        keywords={[`blog`, `gatsby`, `javascript`, `react`]}
      />
      <div className="archive-block">
        <header className="page-head">
          <h2 className="page-head-title">Archives</h2>
        </header>
        <ArchiveBlock data={data} />
      </div>
    </Layout>
  )
}

const indexQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }) {
      edges {
        node {
          frontmatter {
            date(formatString: "YYYY-MM-DD")
            title
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
      <ArchivesPage location={props.location} data={data} {...props} />
    )}
  />
)
