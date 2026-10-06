import React from 'react';
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

interface StoryMeta {
  slug: string;
  title: string;
  summary: string;
  category: 'Physics Explainer' | 'Earthdata Bridge';
  readTime: string;
  badgeVariant: 'flame' | 'plasma';
  icon: typeof Flame;
  experiments: string[];
  gradient: string;
}

const STORIES: StoryMeta[] = [
  {
    slug: 'microgravity-fire',
    title: 'Why Does Fire Burn as a Sphere in Space?',
    summary:
      'Discover why zero-gravity combustion eliminates natural buoyancy convection, creating serene spherical blue flames where molecular diffusion dictates ignition and extinction.',
    category: 'Physics Explainer',
    readTime: '3 min read',
    badgeVariant: 'plasma',
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
    badgeVariant: 'flame',
    icon: Globe,
    experiments: ['NASA FIRMS (MODIS/VIIRS)', 'Saffire-II Cygnus Burn'],
    gradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
  },
];

export const StoryIndexPage: React.FC = () => {
  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="border-b border-white/10 pb-6">
        <div className="eyebrow-pill mb-2">
          <span>Mode 02 • Public Science Communication</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-['Space_Grotesk',sans-serif]">
          Explore Fire: Guided Scientific Stories
        </h1>
        <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-3xl leading-relaxed">
          Interactive narrative journeys designed for students, mission planners, and the public — connecting physical intuition with peer-reviewed NASA microgravity flight observations.
        </p>
      </div>

      {/* Story Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {STORIES.map((story) => {
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
