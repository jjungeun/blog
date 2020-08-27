import React from "react"
import { Link } from "gatsby"

import "../utils/normalize.css"
import "../utils/css/screen.css"

const ArchiveBlock = ({ data }) => {
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
  console.log(data)
  return (
    <div className="archive-block">
      {Object.keys(yearDict).map(year => (
        <div key={year}>
          <h3>{year}</h3>
          {yearDict[year].map(node => (
            <li key={node.frontmatter.title}>
              <Link
                className="archive-title"
                to={node.fields.slug}
                activeStyle={{ color: "red" }}
              >
                {node.frontmatter.title}
              </Link>{" "}
              <small>{node.frontmatter.date}</small>
            </li>
          ))}
        </div>
      ))}
    </div>
  )
}

export default ArchiveBlock
