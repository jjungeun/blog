/**
 * Bio component that queries for data
 * with Gatsby's StaticQuery component
 *
 * See: https://www.gatsbyjs.org/docs/static-query/
 */

import React from "react"
import { StaticQuery, graphql } from "gatsby"
import Image from "gatsby-image"

function Bio() {
  return (
    <StaticQuery
      query={bioQuery}
      render={data => {
        const { author } = data.site.siteMetadata
        return (
          <section>
            <div
              style={{
                padding: "1rem 0",
                textAlign: "center",
              }}
            >
              <Image
                fixed={data.avatar.childImageSharp.fixed}
                alt={author}
                imgStyle={{
                  borderRadius: `20%`,
                }}
              />
              <p>Interested in cloud, linux system and web.</p>
              <p>
                <strong>jungeun9729@gmail.com</strong>
              </p>
            </div>
          </section>
        )
      }}
    />
  )
}

const bioQuery = graphql`
  query BioQuery {
    avatar: file(absolutePath: { regex: "/profile-pic.jpg/" }) {
      childImageSharp {
        fixed(width: 150, height: 150) {
          ...GatsbyImageSharpFixed
        }
      }
    }
    site {
      siteMetadata {
        author
      }
    }
  }
`

export default Bio
