import React from "react"
import { white } from "color-name"
// import { Link } from "gatsby"

function Tag({ name }) {
  return (
    <div className="d-inline-block p-1">
      {/* <Link to={`/tags/${tag}/`}> */}
      <button className="tech-tag text-white">
        <p className="d-inline">{name} </p>
        <div className="d-inline" style={{ fontSize: 20, color: white }}>
          <svg
            role="img"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            width={20}
            height={20}
            style={{ fill: `${[255, 255, 25]}` }}
          >
            <title>{name}</title>
            {/* <path
                        d={name} /> */}
          </svg>
        </div>
      </button>
      {/* </Link> */}
    </div>
  )
}

export default Tag
