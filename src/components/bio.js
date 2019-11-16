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
        const { author, social } = data.site.siteMetadata
        return (
          <section>
            <Image
              fixed={data.avatar.childImageSharp.fixed}
              alt={author}
              imgStyle={{
                borderRadius: `50%`,
              }}
            />
            <p>
<<<<<<< HEAD
              Written by <strong>{author}</strong> who lives and studies in Seoul useful things.
              <br />
              <a href={`https://facebook.com/profile.php?${social.facebook}`}>
                You should follow me on FB.
=======
              Written by <strong>{author}</strong> who lives and works in San
              Francisco building useful things.
              {` `}
              <a href={`https://twitter.com/${social.twitter}`}>
                You should follow him on Twitter
>>>>>>> 28b4ee5deee3272941ef37cda8e23ff4880b06c0
              </a>
            </p>
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
<<<<<<< HEAD
        fixed(width: 50, height: 70) {
=======
        fixed(width: 50, height: 50) {
>>>>>>> 28b4ee5deee3272941ef37cda8e23ff4880b06c0
          ...GatsbyImageSharpFixed
        }
      }
    }
    site {
      siteMetadata {
        author
        social {
<<<<<<< HEAD
          facebook
=======
          twitter
>>>>>>> 28b4ee5deee3272941ef37cda8e23ff4880b06c0
        }
      }
    }
  }
`

export default Bio
