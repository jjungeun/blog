import React from "react"
import "../utils/css/components/tags.css"
import { Link } from "gatsby"
import InlineSVG from "svg-inline-react"

const TechTag = props => {
  const { tag, tech, svg, size, color } = props

  return (
    <span className="tags">
      <Link to={`/tags/${tag}/`}>
        <button className="tech-tag">
          <p className="d-inline">
            <span className="d-inline" style={{ fontSize: size, color: color }}>
              {tech}
              <InlineSVG src={svg} />
            </span>
          </p>
        </button>
      </Link>
    </span>
  )
}

export default TechTag
