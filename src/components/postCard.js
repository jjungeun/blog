import React from "react"
import { Link } from "gatsby"

var colors = [
  "#ffcccc",
  "#ccccff",
  "#ffcc00",
  "#6699ff",
  "#ff9933",
  "#9999ff",
  "#33cccc",
]

export default props => (
  <article
    className={`post-card ${props.count % 4 === 0 && `post-card-large`} ${
      props.postClass
    } ${props.node.frontmatter.thumbnail ? `with-image` : `no-image`}`}
    style={
      props.node.frontmatter.thumbnail && {
        backgroundImage: `url(${props.node.frontmatter.thumbnail.childImageSharp.fluid.src})`,
      }
    }
  >
    <Link to={props.node.fields.slug} className="post-card-link">
      <div
        className="post-card-content"
        style={{
          background: colors[Math.floor(Math.random() * colors.length)],
        }}
      >
        <h2 className="post-card-title" style={{ wordBreak: "keep-all" }}>
          {props.node.frontmatter.title || props.node.fields.slug}
        </h2>
      </div>
    </Link>
  </article>
)
