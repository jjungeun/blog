import React from "react"
import { graphql, StaticQuery } from "gatsby"
import { Link } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"

import "../utils/normalize.css"
import "../utils/css/screen.css"

const ListPage = ({ data }, location) => {
  const siteTitle = data.site.siteMetadata.title
  const lists = data.allDirectory.group
  // console.log(lists)

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
      {lists.map(list => {
        const dirPath = list.fieldValue.split("/")
        const listName = dirPath[dirPath.length - 1]
        return (
          <div>
            <h3 className="post-content-title">
              <Link to={`/${listName}/`}>
                {listName}({list.totalCount})
              </Link>
            </h3>
          </div>
        )
      })}
    </Layout>
  )
}

const indexQuery = graphql`
  query {
    site {
      siteMetadata {
        title
        description
      }
    }
    allDirectory(
      filter: { dir: { regex: "/content/blog//" }, name: { ne: "img" } }
    ) {
      group(field: dir) {
        totalCount
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

export default props => (
  <StaticQuery
    query={indexQuery}
    render={data => (
      <ListPage location={props.location} data={data} {...props} />
    )}
  />
)
