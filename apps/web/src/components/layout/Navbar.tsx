import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAskIgnis } from '../../hooks/useAskIgnis';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { openDrawer } = useAskIgnis();

  const closeMenu = () => setIsOpen(false);

  const isSimulatorActive =
    location.pathname === '/simulator' ||
    location.pathname === '/build' ||
    location.pathname === '/evidence';

  const isFlightDataActive = location.pathname.startsWith('/experiment');
  const isStoriesActive = location.pathname.startsWith('/explore');
  const isAboutActive = location.pathname === '/about';
  const isGapsActive = location.pathname === '/gaps';
  const isAskActive = location.pathname === '/ask';

  const handleAskClick = () => {
    closeMenu();
    openDrawer();
  };

  return (
    <header className="navbar">
      <div className="navrow" data-open={isOpen ? 'true' : 'false'}>
        <Link to="/" className="logo" onClick={closeMenu}>
          IG<i>NIS</i>
        </Link>

        <nav className="links" id="site-nav" aria-label="Main navigation">
          <Link
            to="/simulator"
            aria-current={isSimulatorActive ? 'page' : undefined}
            onClick={closeMenu}
          >
            Simulator
          </Link>
          <Link
            to="/experiments"
            aria-current={isFlightDataActive ? 'page' : undefined}
            onClick={closeMenu}
          >
            Flight Data
          </Link>
          <Link
            to="/explore"
            aria-current={isStoriesActive ? 'page' : undefined}
            onClick={closeMenu}
          >
            Stories
          </Link>
          <Link
            to="/gaps"
            aria-current={isGapsActive ? 'page' : undefined}
            onClick={closeMenu}
          >
            Research Gaps
          </Link>
          <Link
            to="/about"
            aria-current={isAboutActive ? 'page' : undefined}
            onClick={closeMenu}
          >
            About
          </Link>
          <button
            type="button"
            className="enroll"
            aria-current={isAskActive ? 'page' : undefined}
            onClick={handleAskClick}
          >
            Ask IGNIS
          </button>
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
