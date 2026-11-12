import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { useIsVisible } from '../visuals/useIsVisible';

const HowItWorksSection = lazy(() => import('../components/landing/HowItWorksSection'));
const SimulatorMiniDemo = lazy(() => import('../components/landing/SimulatorMiniDemo'));
const ExploreMoreRow = lazy(() => import('../components/landing/ExploreMoreRow'));
const TrustStrip = lazy(() => import('../components/landing/TrustStrip'));

function LazySection({
  children,
  minHeight = '200px',
}: {
  children: React.ReactNode;
  minHeight?: string;
}) {
  const [ref, isVisible] = useIsVisible<HTMLDivElement>({ rootMargin: '300px', once: true });
  return (
    <div ref={ref} style={{ minHeight: isVisible ? undefined : minHeight }}>
      {isVisible ? children : null}
    </div>
  );
}

interface PlanetInfo {
  name: string;
  presetText: string;
  clip: string;
  still: string;
  cutout: string;
  lede: string;
  fallbackGradient: string;
}

const PLANETS: Record<string, PlanetInfo> = {
  orbital: {
    name: 'EARTH',
    presetText: 'ORBITAL (0g MICROGRAVITY)',
    clip: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260827_202422_3ffb4889-c520-432d-8458-038009eb40df.mp4',
    still: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260827_202133_508c64b8-a31e-4290-bdfc-1187df70e0a6.png',
    cutout: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260827_202005_3346cc4d-ec3b-44ab-825c-b18e49f5021a.png',
    lede: 'Build a habitat in microgravity. Adjust cabin oxygen, pressure, and airflow — discover what NASA’s real microgravity combustion experiments reveal about fire behavior in your scenario.',
    fallbackGradient: 'radial-gradient(circle at 60% 40%, #0e2a47 0%, #061121 55%, #02050b 100%)',
  },
  moon: {
    name: 'LUNAR',
    presetText: 'LUNAR (0.16g PARTIAL GRAVITY)',
    clip: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260827_202422_b211cd74-013b-4dd3-bfd0-64491d8696fa.mp4',
    still: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260827_202133_cf55d1d8-7b59-4a64-80da-d72052ae974e.png',
    cutout: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260827_202012_640b239a-d08a-4200-adb2-741bbe129ac8.png',
    lede: 'Design a lunar base habitat. 0.16g partial gravity alters flame dynamics — evidence from microgravity experiments carries an explicit gravity-transfer warning. Discover what the science actually shows.',
    fallbackGradient: 'radial-gradient(circle at 60% 40%, #252b36 0%, #11151c 55%, #050608 100%)',
  },
  mars: {
    name: 'MARS',
    presetText: 'MARS (0.38g PARTIAL GRAVITY)',
    clip: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260827_202422_51eae59a-2459-4c84-907c-cc5edfe5fea7.mp4',
    still: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260827_202133_0ba6de7c-285d-43dc-b7ab-8c54c73707cb.png',
    cutout: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260827_202018_3d559490-f613-4ed7-a3bb-3b7e9fc90fb8.png',
    lede: 'A fire starts halfway to Mars. What does the evidence say? Explore NASA’s combustion research and discover what partial gravity means for flame spread and extinction limits.',
    fallbackGradient: 'radial-gradient(circle at 60% 40%, #4a2116 0%, #210c07 55%, #090302 100%)',
  },
};

const ORDER = ['orbital', 'moon', 'mars'];

// Rotation sequence: Earth (orbital) -> Mars -> Moon -> Earth
const NEXT_PLANET: Record<string, string> = {
  orbital: 'mars',
  mars: 'moon',
  moon: 'orbital',
};

const CHAPTERS = [
  { id: 'how-it-works', num: '01', label: 'How It Works' },
  { id: 'simulator-demo', num: '02', label: 'Flame Morphing' },
  { id: 'explore-more', num: '03', label: 'Flight Archives' },
  { id: 'trust-strip', num: '04', label: 'Provenance' },
];

export const LandingPage: React.FC = () => {
  const [featuredPlanet, setFeaturedPlanet] = useState<string>('orbital');
  const [isPaused, setIsPaused] = useState(false);
  const [showJourneyHud, setShowJourneyHud] = useState(false);
  const [activeChapter, setActiveChapter] = useState('how-it-works');
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
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Auto-rotate featured celestial body every 5.5 seconds unless user is interacting
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setFeaturedPlanet((current) => {
        const next = NEXT_PLANET[current] || 'orbital';
        warmClip(next);
        return next;
      });
    }, 5500);

    return () => clearInterval(timer);
  }, [isPaused]);

  // Track scroll position to reveal bottom journey HUD and update active chapter
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setShowJourneyHud(y > 350);

      const offsets = CHAPTERS.map((ch) => {
        const el = document.getElementById(ch.id);
        if (!el) return { id: ch.id, distance: Infinity };
        const rect = el.getBoundingClientRect();
        return { id: ch.id, distance: Math.abs(rect.top - 140) };
      });
      offsets.sort((a, b) => a.distance - b.distance);
      if (offsets[0] && offsets[0].distance < 700) {
        setActiveChapter(offsets[0].id);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const currentIndex = ORDER.indexOf(featuredPlanet);
  const leftPlanetKey = ORDER[(currentIndex + 2) % 3];
  const rightPlanetKey = ORDER[(currentIndex + 1) % 3];

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -90;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const scrollToHowItWorks = () => {
    scrollToSection('how-it-works');
  };

  return (
    <div className="relative min-h-screen text-white">
      {/* ======================================================================
          HERO STAGE (PIXEL-IDENTICAL ARCHITECTURE & DESIGN)
          ====================================================================== */}
      <section
        className="stage"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        <div
          className="sky"
          style={{
            backgroundColor: '#060813',
            backgroundImage: `url("${PLANETS[featuredPlanet].still}"), ${PLANETS[featuredPlanet].fallbackGradient}`,
          }}
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
                style={{
                  backgroundColor: '#060813',
                  backgroundImage: planet.fallbackGradient,
                }}
                onError={(e) => {
                  // Offline fallback: hide video and let CSS gradient/poster render gracefully
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
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
              <div key={featuredPlanet} className="dest-preset-pill hero-fade-change">
                <span className="dest-indicator-dot" />
                <span className="dest-preset-label">ENVIRONMENT PRESET: </span>
                <span className="dest-name">{PLANETS[featuredPlanet].presetText}</span>
              </div>
            </div>

            <p key={`lede-${featuredPlanet}`} className="col lede hero-fade-change">
              {PLANETS[featuredPlanet].lede}
            </p>

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
                <Link to="/response" className="cta-secondary cursor-pointer">
                  Explore Fire Response
                </Link>
              </div>

              <span key={`lbl-l-${leftPlanetKey}`} className="label label-l hero-fade-change">
                {PLANETS[leftPlanetKey].name}
              </span>
              <span key={`lbl-r-${rightPlanetKey}`} className="label label-r hero-fade-change">
                {PLANETS[rightPlanetKey].name}
              </span>
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
        <LazySection minHeight="260px">
          <Suspense fallback={<div className="h-64" />}>
            <HowItWorksSection />
          </Suspense>
        </LazySection>

        <LazySection minHeight="420px">
          <Suspense fallback={<div className="h-96" />}>
            <SimulatorMiniDemo />
          </Suspense>
        </LazySection>

        <LazySection minHeight="200px">
          <Suspense fallback={<div className="h-52" />}>
            <ExploreMoreRow />
          </Suspense>
        </LazySection>

        <LazySection minHeight="90px">
          <Suspense fallback={<div className="h-24" />}>
            <TrustStrip />
          </Suspense>
        </LazySection>
      </div>

      {/* Floating Journey HUD (Inspired by ECLIPSE) */}
      {showJourneyHud && (
        <nav
          className="bottom-hud-journey transition-all duration-300 animate-fade-in"
          aria-label="Landing page journey navigation"
        >
          <div className="travel-hint hidden md:flex">
            <span className="scroll-mouse" />
            <span>EXPLORE</span>
          </div>
          <div className="chapter-nav-pills">
            {CHAPTERS.map((ch) => (
              <button
                key={ch.id}
                type="button"
                onClick={() => scrollToSection(ch.id)}
                className={`chapter-pill-btn ${activeChapter === ch.id ? 'is-active' : ''}`}
                title={`Jump to ${ch.label}`}
              >
                <b>{ch.num}</b>
                <span className="hidden sm:inline">{ch.label}</span>
              </button>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
};

export default LandingPage;
