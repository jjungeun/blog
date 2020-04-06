import React from "react"
import { graphql, StaticQuery } from "gatsby"
import { Link } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"

import "../utils/normalize.css"
import "../utils/css/screen.css"

const CategoryPage = ({ data }, location) => {
  const siteTitle = data.site.siteMetadata.title
  const categories = data.allDirectory.group

  return (
    <Layout title={siteTitle}>
      <SEO
        title="All posts"
        keywords={[`blog`, `gatsby`, `javascript`, `react`]}
      />
      <div className="category-block">
        <header className="page-head">
          <h2 className="page-head-title">Categories</h2>
        </header>
        {categories.map(category => {
          const dirPath = category.fieldValue.split("/")
          const categoryName = dirPath[dirPath.length - 1]
          return (
            <div key={categoryName}>
              <li className="category-title">
                <Link to={`/category/${categoryName}/`}>
                  {categoryName} ({category.totalCount})
                </Link>
              </li>
            </div>
          )
        })}
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
    allDirectory(
      filter: { dir: { regex: "/content/blog//" }, name: { ne: "img" } }
    ) {
      group(field: dir) {
        totalCount
        fieldValue
      }
    }
  }
`

export default props => (
  <StaticQuery
    query={indexQuery}
    render={data => (
      <CategoryPage location={props.location} data={data} {...props} />
    )}
  />
)
