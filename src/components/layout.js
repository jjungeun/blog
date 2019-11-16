import React from "react"
import { Link } from "gatsby"

const Layout = props => {
  const { title, children } = props
  const [toggleNav, setToggleNav] = React.useState(false)
  return (
    <div className={`site-wrapper ${toggleNav ? `site-head-open` : ``}`}>
      <header className="site-head">
        <div className="site-head-container">
          <a
            className="nav-burger"
            href={`#`}
            onClick={() => setToggleNav(!toggleNav)}
          >
            <div
              className="hamburger hamburger--collapse"
              aria-label="Menu"
              role="button"
              aria-controls="navigation"
            >
              <div className="hamburger-box">
                <div className="hamburger-inner" />
              </div>
            </div>
          </a>
          <nav id="swup" class="site-head-left">
            <ul className="nav" role="menu">
<<<<<<< HEAD
              <li className="nav-elements" role="menuitem">
                <Link to={`/archive`}>Archive</Link>
=======
              <li className="nav-home nav-current" role="menuitem">
                <Link to={`/`}>Home</Link>
>>>>>>> 28b4ee5deee3272941ef37cda8e23ff4880b06c0
              </li>
              <li className="nav-about" role="menuitem">
                <Link to={`/about`}>About</Link>
              </li>
<<<<<<< HEAD
=======
              <li className="nav-elements" role="menuitem">
                <Link to={`/elements`}>Elements</Link>
              </li>
>>>>>>> 28b4ee5deee3272941ef37cda8e23ff4880b06c0
            </ul>
          </nav>
          <div className="site-head-center">
            <Link className="site-head-logo" to={`/`}>
              {title}
            </Link>
          </div>
          <div className="site-head-right">
            <div className="social-links">
              <a
<<<<<<< HEAD
                href="https://facebook.com/profile.php?id=100010743251101"
=======
                href="https://www.facebook.com"
>>>>>>> 28b4ee5deee3272941ef37cda8e23ff4880b06c0
                title="Facebook"
                target="_blank"
                rel="noopener noreferrer"
              >
                Facebook
              </a>
              <a
<<<<<<< HEAD
                href="https://github.com/jjungeun"
                title="Github"
                target="_blank"
                rel="noopener noreferrer"
              >
                Github
=======
                href="https://twitter.com"
                title="Twitter"
                target="_blank"
                rel="noopener noreferrer"
              >
                Twitter
>>>>>>> 28b4ee5deee3272941ef37cda8e23ff4880b06c0
              </a>
              <Link
                to={`/rss.xml`}
                title="RSS"
                target="_blank"
                rel="noopener noreferrer"
              >
                RSS
              </Link>
            </div>
          </div>
        </div>
      </header>
      <main id="site-main" className="site-main">
        <div id="swup" className="transition-fade">
          {children}
        </div>
      </main>
      <footer className="site-foot">
        &copy; {new Date().getFullYear()} <Link to={`/`}>{title}</Link> &mdash;
<<<<<<< HEAD
=======
        Built with{" "}
        <a
          href="https://gatsbyjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Gatsby
        </a>
>>>>>>> 28b4ee5deee3272941ef37cda8e23ff4880b06c0
      </footer>
    </div>
  )
}

export default Layout
