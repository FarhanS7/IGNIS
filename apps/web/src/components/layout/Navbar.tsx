import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const closeMenu = () => setIsOpen(false);

  const isSimulatorActive =
    location.pathname === '/' ||
    location.pathname === '/simulator' ||
    location.pathname === '/build' ||
    location.pathname === '/evidence';

  const isLearnActive =
    location.pathname.startsWith('/explore') ||
    location.pathname.startsWith('/stories') ||
    location.pathname.startsWith('/story');

  const isAskActive = location.pathname === '/ask';
  const isGapsActive = location.pathname === '/gaps';
  const isDataActive =
    location.pathname.startsWith('/experiment') ||
    location.pathname === '/about';

  return (
    <header className="navbar">
      <div className="navrow" data-open={isOpen ? 'true' : 'false'}>
        <Link to="/" className="logo" onClick={closeMenu}>
          IG<i>NIS</i>
        </Link>

        <nav className="links" id="site-nav" aria-label="Main navigation">
          {/* Item 1: Simulator (home) */}
          <Link
            to="/simulator"
            aria-current={isSimulatorActive ? 'page' : undefined}
            onClick={closeMenu}
          >
            Simulator
          </Link>

          {/* Item 2: Learn (Story Mode) */}
          <Link
            to="/explore"
            aria-current={isLearnActive ? 'page' : undefined}
            onClick={closeMenu}
          >
            Learn
          </Link>

          {/* Item 3: Ask */}
          <Link
            to="/ask"
            aria-current={isAskActive ? 'page' : undefined}
            onClick={closeMenu}
          >
            Ask
          </Link>

          {/* Item 4: What's untested (/gaps) */}
          <Link
            to="/gaps"
            aria-current={isGapsActive ? 'page' : undefined}
            onClick={closeMenu}
          >
            What's untested
          </Link>

          {/* Item 5: Data & Sources (Explorer + About merged) */}
          <Link
            to="/experiments"
            aria-current={isDataActive ? 'page' : undefined}
            onClick={closeMenu}
          >
            Data & Sources
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
