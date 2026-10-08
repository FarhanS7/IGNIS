import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Footer: React.FC = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';

  const scrollTo = (id: string) => {
    if (isHome) {
      const el = document.getElementById(id);
      if (el) {
        const yOffset = -90;
        const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="ignis-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <h3>IG<i>NIS</i></h3>
          <p>
            Intelligent Guidance from NASA Ignition Studies. An evidence-grounded interactive exploration system for microgravity combustion and space habitat safety.
          </p>
          <div style={{ marginTop: '18px', fontSize: '13px', color: 'var(--cyan)' }}>
            NASA International Space Apps Challenge 2026
          </div>
        </div>

        <div className="footer-links-col">
          <h4>Architecture</h4>
          <ul>
            <li>
              {isHome ? (
                <button type="button" onClick={() => scrollTo('overview')}>
                  Executive Summary
                </button>
              ) : (
                <Link to="/#overview">Executive Summary</Link>
              )}
            </li>
            <li>
              <Link to="/build">Build a Habitat Studio</Link>
            </li>
            <li>
              <Link to="/experiments">NASA Experiment Catalog</Link>
            </li>
            <li>
              {isHome ? (
                <button type="button" onClick={() => scrollTo('evidence-engine')}>
                  Evidence Engine (A–E)
                </button>
              ) : (
                <Link to="/about">Evidence Model & ADRs</Link>
              )}
            </li>
            <li>
              {isHome ? (
                <button type="button" onClick={() => scrollTo('flame-vision')}>
                  AI Flame Vision
                </button>
              ) : (
                <Link to="/experiment/exp-flex-2">Droplet Flame Analytics</Link>
              )}
            </li>
          </ul>
        </div>

        <div className="footer-links-col">
          <h4>NASA Research</h4>
          <ul>
            <li>
              <a href="https://psi.nasa.gov" target="_blank" rel="noopener noreferrer">
                Physical Sciences Informatics (PSI) ↗
              </a>
            </li>
            <li>
              <a
                href="https://www.nasa.gov/mission_pages/station/research/experiments/explorer/Investigation.html?#id=1010"
                target="_blank"
                rel="noopener noreferrer"
              >
                Saffire Investigation ↗
              </a>
            </li>
            <li>
              <a href="https://www.nasa.gov" target="_blank" rel="noopener noreferrer">
                FLEX Droplet Studies ↗
              </a>
            </li>
            <li>
              <a href="https://firms.modaps.eosdis.nasa.gov" target="_blank" rel="noopener noreferrer">
                Earthdata FIRMS ↗
              </a>
            </li>
          </ul>
        </div>

        <div className="footer-links-col">
          <h4>Challenge</h4>
          <ul>
            <li>
              <span className="text-slate-400">Flame in Freefall</span>
            </li>
            <li>
              <Link to="/about">Scientific Methodology</Link>
            </li>
            <li>
              <Link to="/ask">Grounded RAG Assistant</Link>
            </li>
            <li>
              <Link to="/explore">Guided Science Stories</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div>&copy; 2026 IGNIS Team • NASA Space Apps Challenge 2026. Built with NASA Open Data.</div>
        <div>Scientific Disclaimer: Not a certified spacecraft life safety calculation tool.</div>
      </div>
    </footer>
  );
};
