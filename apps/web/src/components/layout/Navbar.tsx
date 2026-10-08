import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const closeMenu = () => setIsOpen(false);

  return (
    <header className="navbar">
      <div className="navrow" data-open={isOpen ? 'true' : 'false'}>
        <Link to="/" className="logo" onClick={closeMenu}>
          IG<i>NIS</i>
        </Link>

        <nav className="links" id="site-nav" aria-label="Main navigation">
          <Link
            to="/build"
            aria-current={location.pathname === '/build' ? 'page' : undefined}
            onClick={closeMenu}
          >
            Fire Lab
          </Link>
          <Link
            to="/explore"
            aria-current={location.pathname.startsWith('/explore') ? 'page' : undefined}
            onClick={closeMenu}
          >
            Stories
          </Link>
          <Link
            to="/experiments"
            aria-current={location.pathname.startsWith('/experiment') ? 'page' : undefined}
            onClick={closeMenu}
          >
            Flight Data
          </Link>
          <Link
            to="/about"
            aria-current={location.pathname === '/about' ? 'page' : undefined}
            onClick={closeMenu}
          >
            Methodology
          </Link>
          <Link
            to="/ask"
            className="enroll"
            aria-current={location.pathname === '/ask' ? 'page' : undefined}
            onClick={closeMenu}
          >
            Ask IGNIS
          </Link>
        </nav>

        <button
          className="burger"
          type="button"
          aria-label={isOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={isOpen}
          aria-controls="site-nav"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
