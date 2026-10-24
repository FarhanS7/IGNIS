import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Globe,
  Flame,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { api } from '../lib/api';

interface StoryMeta {
  slug: string;
  title: string;
  summary: string;
  category: 'Physics Explainer' | 'Earthdata Bridge';
  readTime: string;
  badgeVariant: 'strong' | 'moderate' | 'neutral';
  icon: typeof Flame;
  experiments: string[];
  gradient: string;
}

const DEFAULT_STORIES: StoryMeta[] = [
  {
    slug: 'microgravity-fire',
    title: 'Why Does Fire Burn as a Sphere in Space?',
    summary:
      'Discover why zero-gravity combustion eliminates natural buoyancy convection, creating serene spherical blue flames where molecular diffusion dictates ignition and extinction.',
    category: 'Physics Explainer',
    readTime: '3 min read',
    badgeVariant: 'strong',
    icon: Flame,
    experiments: ['FLEX-2 Droplet Combustion', 'Saffire-I Spacecraft Burn'],
    gradient: 'from-cyan-500/20 via-blue-500/10 to-transparent',
  },
  {
    slug: 'fire-from-space',
    title: 'Fire from Space vs Fire in Space',
    summary:
      'Bridging NASA Earthdata FIRMS satellite middle-infrared thermal anomaly sensing of planetary wildfires with enclosed spacecraft combustion inside the Cygnus vehicle.',
    category: 'Earthdata Bridge',
    readTime: '4 min read',
    badgeVariant: 'strong',
    icon: Globe,
    experiments: ['NASA FIRMS (MODIS/VIIRS)', 'Saffire-II Cygnus Burn'],
    gradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
  },
];

export const StoryIndexPage: React.FC = () => {
  const [stories, setStories] = useState<StoryMeta[]>(DEFAULT_STORIES);

  useEffect(() => {
    let active = true;
    api.getStories()
      .then((remoteStories) => {
        if (active && remoteStories && remoteStories.length > 0) {
          const mapped: StoryMeta[] = remoteStories.map((s) => ({
            slug: s.slug,
            title: s.title,
            summary: s.summary || '',
            category: s.slug.includes('earth') || s.slug.includes('space-vs') ? 'Earthdata Bridge' : 'Physics Explainer',
            readTime: '3 min read',
            badgeVariant: 'strong',
            icon: s.slug.includes('earth') ? Globe : Flame,
            experiments: ['NASA PSI Flight Archives', 'Cygnus Saffire Series'],
            gradient: s.slug.includes('earth')
              ? 'from-amber-500/20 via-orange-500/10 to-transparent'
              : 'from-cyan-500/20 via-blue-500/10 to-transparent',
          }));
          setStories(mapped);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch stories from API, using default story index:', err);
      });

    return () => {
      active = false;
    };
  }, []);
  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="border-b border-white/10 pb-6">
        <div className="eyebrow-pill mb-2">
          <span>Mode 02 • Public Science Communication</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-['Space_Grotesk',sans-serif]">
          Stories: Guided Scientific Narratives
        </h1>
        <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-3xl leading-relaxed">
          Interactive narrative journeys designed for students, mission planners, and the public — connecting physical intuition with peer-reviewed NASA microgravity flight observations.
        </p>
      </div>

      {/* Featured Entry Point: Story Mode v2 */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0b1f3d] via-[#09152b] to-[#170e28] border-2 border-cyan-400/40 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-400/20 text-cyan-300 font-mono text-xs font-semibold uppercase tracking-wider border border-cyan-400/30">
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                Featured Experience • Story Mode v2
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400/15 text-amber-300 font-mono text-xs font-medium border border-amber-400/20">
                Chapter 1 Available
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold font-['Space_Grotesk'] text-white">
              Why is a flame round in space?
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Experience our student-friendly, scroll-driven science journey. Featuring <strong>Ember</strong> (your interactive flame guide), real-time 3D gravity morphing from 1g to 0g, and verified telemetry citations from NASA FLEX and Saffire missions.
            </p>
          </div>

          <div className="shrink-0 w-full md:w-auto">
            <Link
              to="/stories/v2"
              className="inline-flex items-center justify-center gap-2 w-full md:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold font-['Space_Grotesk'] text-sm sm:text-base transition-all shadow-lg shadow-cyan-500/25 hover:scale-102"
            >
              <span>Explore Story Mode v2</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Classic Story Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-slate-400" />
          <span>Mission Reference Stories</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {stories.map((story) => {
          const Icon = story.icon;
          return (
            <Card
              key={story.slug}
              variant="interactive"
              padding="lg"
              className="flex flex-col justify-between border-white/15 hover:border-cyan-400/50 transition-all group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                      <Clock className="w-3 h-3" />
                      {story.readTime}
                    </span>
                    <Badge variant={story.badgeVariant} size="xs">
                      {story.category}
                    </Badge>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors font-['Space_Grotesk',sans-serif] leading-tight">
                    {story.title}
                  </h2>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {story.summary}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/10">
                  <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                    Integrated Flight Research:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {story.experiments.map((exp, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-black/40 border border-white/10 text-[11px] font-mono text-cyan-300"
                      >
                        {exp}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <Link to={`/explore/${story.slug}`} className="block">
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full justify-between"
                  >
                    <span>Launch Story Narrative</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </Card>
          );
        })}
      </div>

      {/* RAG Research Bridge Banner */}
      <div className="glass-card p-6 sm:p-8 rounded-2xl border border-white/15 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 text-xs text-amber-300 font-semibold font-mono">
            <Sparkles className="w-4 h-4" />
            <span>Have a specific research inquiry?</span>
          </div>
          <h3 className="text-xl font-bold text-white font-['Space_Grotesk',sans-serif]">
            Query the Grounded NASA Knowledge Base
          </h3>
          <p className="text-xs text-slate-300 max-w-xl">
            Ask IGNIS answers questions about quench limits, material flammability, and droplet chemistry citing NASA PSI literature.
          </p>
        </div>

        <Link to="/ask">
          <Button variant="outline" size="md" icon={<BookOpen className="w-4 h-4 text-cyan-400" />}>
            Ask IGNIS RAG Studio
          </Button>
        </Link>
      </div>
    </div>
  );
};
