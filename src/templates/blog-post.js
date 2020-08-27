import React from "react"

import { graphql } from "gatsby"
import Img from "gatsby-image"

import Layout from "../components/layout"
import SEO from "../components/seo"
import TechTag from "../components/techtag"
import Utterances from "../components/utterances"

class BlogPostTemplate extends React.Component {
  render() {
    const post = this.props.data.markdownRemark
    const metadata = this.props.data.site.siteMetadata
    const siteTitle = metadata.title
    const labels = metadata.labels
    const tags = post.frontmatter.tags

    const getTechTags = () => {
      const techTags = []
      tags.forEach((tag, i) => {
        labels.forEach(label => {
          if (tag === label.tag) {
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
          }
        })
      })
      return techTags
    }

    return (
      <Layout location={this.props.location} title={siteTitle}>
        <SEO
          title={post.frontmatter.title}
          description={post.frontmatter.description || post.excerpt}
        />
        <article
          className={`post-content ${post.frontmatter.thumbnail || `no-image`}`}
        >
          <header className="post-content-header">
            <h1 className="post-content-title">{post.frontmatter.title}</h1>
            {post.frontmatter.date && (
              <div className="post-date">{post.frontmatter.date}</div>
            )}
            {post.frontmatter.tags && (
              <div className="post-tag">{getTechTags()}</div>
            )}
          </header>

          {post.frontmatter.description && (
            <p className="post-content-excerpt">
              {post.frontmatter.description}
            </p>
          )}

          {post.frontmatter.thumbnail && (
            <div className="post-content-image">
              <Img
                className="kg-image"
                fluid={post.frontmatter.thumbnail.childImageSharp.fluid}
                alt={post.frontmatter.title}
              />
            </div>
          )}

          <div
            className="post-content-body"
            dangerouslySetInnerHTML={{ __html: post.html }}
          />

          <Utterances />

          <footer className="post-content-footer">
            {/* There are two options for how we display the byline/author-info.
        If the post has more than one author, we load a specific template
        from includes/byline-multiple.hbs, otherwise, we just use the
        default byline. */}
          </footer>
        </article>
      </Layout>
    )
  }
}

export default BlogPostTemplate

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    site {
      siteMetadata {
        title
        author
        labels {
          tag
          tech
          svg
          size
          color
        }
      }
    }
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      excerpt(pruneLength: 160)
      html
      frontmatter {
        title
        date(formatString: "YYYY-MM-DD")
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
    }
  }
`
