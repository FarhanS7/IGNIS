import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';

  const scrollToSection = (sectionId: string) => {
    setIsOpen(false);
    if (!isHome) {
      navigate('/#' + sectionId);
      return;
    }
    const el = document.getElementById(sectionId);
    if (el) {
      const yOffset = -90;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    // If arriving at home with a hash
    if (isHome && location.hash) {
      const id = location.hash.replace('#', '');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          const yOffset = -90;
          const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 100);
    }
  }, [isHome, location.hash]);

  return (
    <header className="navbar">
      <div className="navrow" data-open={isOpen ? 'true' : 'false'}>
        <Link to="/" className="logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          IG<i>NIS</i>
        </Link>

        <nav className="links" id="site-nav" aria-label="Main navigation">
          {isHome ? (
            <>
              <button type="button" onClick={() => scrollToSection('overview')}>
                Overview
              </button>
              <button type="button" onClick={() => scrollToSection('habitat-builder')}>
                Build Habitat
              </button>
              <button type="button" onClick={() => scrollToSection('evidence-engine')}>
                Evidence Engine
              </button>
              <button type="button" onClick={() => scrollToSection('flame-vision')}>
                Flame Vision
              </button>
              <button type="button" onClick={() => scrollToSection('explore-fire')}>
                Explore Fire
              </button>
              <button type="button" onClick={() => scrollToSection('safety-matrix')}>
                Safety Graph
              </button>
              <Link to="/experiments">
                Experiments
              </Link>
              <button
                type="button"
                className="enroll"
                onClick={() => scrollToSection('ask-ignis')}
              >
                Ask IGNIS
              </button>
            </>
          ) : (
            <>
              <Link to="/#overview" onClick={() => setIsOpen(false)}>
                Home
              </Link>
              <Link
                to="/build"
                aria-current={location.pathname === '/build' ? 'page' : undefined}
                onClick={() => setIsOpen(false)}
              >
                Build Habitat
              </Link>
              <Link
                to="/experiments"
                aria-current={location.pathname.startsWith('/experiment') ? 'page' : undefined}
                onClick={() => setIsOpen(false)}
              >
                NASA Experiments
              </Link>
              <Link
                to="/explore"
                aria-current={location.pathname.startsWith('/explore') ? 'page' : undefined}
                onClick={() => setIsOpen(false)}
              >
                Fire Stories
              </Link>
              <Link
                to="/about"
                aria-current={location.pathname === '/about' ? 'page' : undefined}
                onClick={() => setIsOpen(false)}
              >
                About & Method
              </Link>
              <Link
                to="/ask"
                className="enroll"
                onClick={() => setIsOpen(false)}
              >
                Ask IGNIS
              </Link>
            </>
          )}
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
