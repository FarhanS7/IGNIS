import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="ignis-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Link to="/" className="text-xl font-bold tracking-tight text-white hover:text-cyan-300 transition-colors">
            IG<span className="text-cyan-400 font-normal">NIS</span>
          </Link>
          <p>
            Intelligent Guidance from NASA Ignition Studies. An evidence-grounded interactive exploration system for microgravity combustion and space habitat safety.
          </p>
          <div style={{ marginTop: '18px', fontSize: '13px', color: 'var(--cyan)' }}>
            NASA International Space Apps Challenge 2026
          </div>
        </div>

        <div className="footer-links-col">
          <h4>Explore IGNIS</h4>
          <ul>
            <li>
              <Link to="/build">Habitat Fire Lab (Simulator)</Link>
            </li>
            <li>
              <Link to="/explore">Guided Science Stories</Link>
            </li>
            <li>
              <Link to="/experiments">Flight Experiments & Vision</Link>
            </li>
            <li>
              <Link to="/about">Methodology & Provenance</Link>
            </li>
            <li>
              <Link to="/ask">Ask IGNIS AI Assistant</Link>
            </li>
          </ul>
        </div>

        <div className="footer-links-col">
          <h4>NASA Data Sources</h4>
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
                Saffire Cygnus Missions ↗
              </a>
            </li>
            <li>
              <a href="https://www.nasa.gov" target="_blank" rel="noopener noreferrer">
                FLEX Droplet Investigation ↗
              </a>
            </li>
            <li>
              <a href="https://firms.modaps.eosdis.nasa.gov" target="_blank" rel="noopener noreferrer">
                NASA Earthdata FIRMS ↗
              </a>
            </li>
          </ul>
        </div>

        <div className="footer-links-col">
          <h4>Compliance & Trust</h4>
          <ul>
            <li>
              <span className="text-slate-400">PRD v1.1 5-Tier Trust Engine</span>
            </li>
            <li>
              <Link to="/about#disclaimers">Non-Operational Certification</Link>
            </li>
            <li>
              <span className="text-slate-400">NASA-STD-6001B Flammability</span>
            </li>
            <li>
              <a href="https://github.com/FarhanS7/IGNIS" target="_blank" rel="noopener noreferrer">
                GitHub Repository ↗
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-legal">
          <span>NASA Space Apps Challenge 2026</span>
          <span className="sep">•</span>
          <span>Challenge: Flame in Freefall</span>
          <span className="sep">•</span>
          <span>Illustrative Research System (PRD v1.1 §1.1)</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
