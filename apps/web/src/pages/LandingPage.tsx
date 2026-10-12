import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HowItWorksSection } from '../components/landing/HowItWorksSection';
import { SimulatorMiniDemo } from '../components/landing/SimulatorMiniDemo';
import { ExploreMoreRow } from '../components/landing/ExploreMoreRow';
import { TrustStrip } from '../components/landing/TrustStrip';

interface PlanetInfo {
  name: string;
  presetText: string;
  clip: string;
  still: string;
  cutout: string;
  lede: string;
}

const PLANETS: Record<string, PlanetInfo> = {
  orbital: {
    name: 'ORBITAL',
    presetText: 'ORBITAL (0g MICROGRAVITY)',
    clip: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260827_202422_3ffb4889-c520-432d-8458-038009eb40df.mp4',
    still: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260827_202133_508c64b8-a31e-4290-bdfc-1187df70e0a6.png',
    cutout: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260827_202005_3346cc4d-ec3b-44ab-825c-b18e49f5021a.png',
    lede: 'Build a habitat in microgravity. Adjust cabin oxygen, pressure, and airflow — discover what NASA’s real microgravity combustion experiments reveal about fire behavior in your scenario.',
  },
  moon: {
    name: 'LUNAR',
    presetText: 'LUNAR (0.16g PARTIAL GRAVITY)',
    clip: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260827_202422_b211cd74-013b-4dd3-bfd0-64491d8696fa.mp4',
    still: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260827_202133_cf55d1d8-7b59-4a64-80da-d72052ae974e.png',
    cutout: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260827_202012_640b239a-d08a-4200-adb2-741bbe129ac8.png',
    lede: 'Design a lunar base habitat. 0.16g partial gravity alters flame dynamics — evidence from microgravity experiments carries an explicit gravity-transfer warning. Discover what the science actually shows.',
  },
  mars: {
    name: 'MARS',
    presetText: 'MARS (0.38g PARTIAL GRAVITY)',
    clip: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260827_202422_51eae59a-2459-4c84-907c-cc5edfe5fea7.mp4',
    still: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260827_202133_0ba6de7c-285d-43dc-b7ab-8c54c73707cb.png',
    cutout: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260827_202018_3d559490-f613-4ed7-a3bb-3b7e9fc90fb8.png',
    lede: 'A fire starts halfway to Mars. What does the evidence say? Explore NASA’s combustion research and discover what partial gravity means for flame spread and extinction limits.',
  },
};

const ORDER = ['orbital', 'moon', 'mars'];

export const LandingPage: React.FC = () => {
  const [featuredPlanet, setFeaturedPlanet] = useState<string>('orbital');
  const [loadedClips, setLoadedClips] = useState<Record<string, boolean>>({
    orbital: true,
  });

  const warmClip = (planetKey: string) => {
    setLoadedClips((prev) => {
      if (prev[planetKey]) return prev;
      return { ...prev, [planetKey]: true };
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      ORDER.forEach((p) => warmClip(p));
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const currentIndex = ORDER.indexOf(featuredPlanet);
  const leftPlanetKey = ORDER[(currentIndex + 2) % 3];
  const rightPlanetKey = ORDER[(currentIndex + 1) % 3];

  const scrollToHowItWorks = () => {
    const el = document.getElementById('how-it-works');
    if (el) {
      const yOffset = -90;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen text-white">
      {/* ======================================================================
          HERO STAGE (PIXEL-IDENTICAL ARCHITECTURE & DESIGN)
          ====================================================================== */}
      <section className="stage">
        <div
          className="sky"
          style={{ backgroundImage: `url("${PLANETS[featuredPlanet].still}")` }}
        >
          {ORDER.map((p) => {
            const planet = PLANETS[p];
            const isActive = featuredPlanet === p;
            const isLoaded = !!loadedClips[p];
            return (
              <video
                key={p}
                className={isActive ? 'is-active' : ''}
                autoPlay={isActive}
                preload={isActive ? 'auto' : 'none'}
                src={isLoaded ? planet.clip : undefined}
                poster={planet.still}
                muted
                loop
                playsInline
                aria-hidden="true"
              />
            );
          })}
        </div>

        <div className="ui">
          <main className="copy">
            <div className="col eyebrow">
              <div className="hero-badge">
                <span className="hero-badge-dot" />
                <span className="hero-badge-text">
                  NASA SPACE APPS CHALLENGE 2026 • FLAME IN FREEFALL
                </span>
              </div>
            </div>

            <h1 className="col title">
              Build a Space Habitat.<br />
              <span className="hero-gradient-text">Discover the Fire Science.</span>
            </h1>

            <div className="col dest-preset-wrapper">
              <div className="dest-preset-pill">
                <span className="dest-indicator-dot" />
                <span className="dest-preset-label">ENVIRONMENT PRESET: </span>
                <span className="dest-name">{PLANETS[featuredPlanet].presetText}</span>
              </div>
            </div>

            <p className="col lede">{PLANETS[featuredPlanet].lede}</p>

            <div className="col cta">
              {/* Left Planet Switcher Button */}
              <button
                className="planet planet-l"
                type="button"
                onMouseEnter={() => warmClip(leftPlanetKey)}
                onFocus={() => warmClip(leftPlanetKey)}
                onClick={() => {
                  warmClip(leftPlanetKey);
                  setFeaturedPlanet(leftPlanetKey);
                }}
                title={`Switch environment to ${PLANETS[leftPlanetKey].name}`}
                aria-label={`Show ${PLANETS[leftPlanetKey].name}`}
              >
                <img
                  className="is-shown"
                  alt={PLANETS[leftPlanetKey].name}
                  src={PLANETS[leftPlanetKey].cutout}
                />
              </button>

              {/* Right Planet Switcher Button */}
              <button
                className="planet planet-r"
                type="button"
                onMouseEnter={() => warmClip(rightPlanetKey)}
                onFocus={() => warmClip(rightPlanetKey)}
                onClick={() => {
                  warmClip(rightPlanetKey);
                  setFeaturedPlanet(rightPlanetKey);
                }}
                title={`Switch environment to ${PLANETS[rightPlanetKey].name}`}
                aria-label={`Show ${PLANETS[rightPlanetKey].name}`}
              >
                <img
                  className="is-shown"
                  alt={PLANETS[rightPlanetKey].name}
                  src={PLANETS[rightPlanetKey].cutout}
                />
              </button>

              {/* Hero Action Buttons */}
              <div className="cta-actions">
                <Link to="/simulator" className="cursor-pointer">
                  Try the Simulator
                </Link>
                <Link to="/experiments" className="cta-secondary cursor-pointer">
                  Watch real NASA flight data
                </Link>
              </div>

              <span className="label label-l">{PLANETS[leftPlanetKey].name}</span>
              <span className="label label-r">{PLANETS[rightPlanetKey].name}</span>
            </div>
          </main>
        </div>

        {/* Smooth Scroll Down Indicator */}
        <button
          className="scroll"
          type="button"
          onClick={scrollToHowItWorks}
          aria-label="Scroll to how it works section"
        >
          <svg viewBox="0 0 26 33" fill="none" aria-hidden="true">
            <path
              d="M13 1.5 V31.5 M1.9 20.4 L13 31.5 L24.1 20.4"
              stroke="#ffffff"
              strokeWidth="3"
              strokeLinecap="square"
              strokeLinejoin="miter"
            />
          </svg>
        </button>
      </section>

      {/* ======================================================================
          STREAMLINED MODULAR SECTIONS
          ====================================================================== */}
      <div className="relative z-10 space-y-4 pb-20">
        <HowItWorksSection />
        <SimulatorMiniDemo />
        <ExploreMoreRow />
        <TrustStrip />
      </div>
    </div>
  );
};

export default LandingPage;
