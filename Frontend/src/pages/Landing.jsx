import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StepCard from '../components/StepCard';
import { ArrowRight, Lightbulb, Compass, FileText, Star, ShieldCheck, Zap } from 'lucide-react';

const Landing = () => {
  const features = [
    {
      title: 'Idea Validation',
      description: 'Stress-test startup concepts using 9 real-time feasibility indices. Map customer pain-points, review competitive matrices, and gauge market demand instantly.',
      icon: Lightbulb,
      badge: 'Step 1 & 3'
    },
    {
      title: 'Roadmap Generator',
      description: 'Convert validated ideas into milestone checklists. Calibrated against your burn limits, available funding capacity, technology stack, and engineering horizons.',
      icon: Compass,
      badge: 'Core Feature'
    },
    {
      title: 'Documentation Generator',
      description: 'Draft investor-ready pitch decks, revenue models, financial templates, and comprehensive technical requirements docs with zero manual writing.',
      icon: FileText,
      badge: 'SaaS Power'
    }
  ];

  return (
    <div className="relative min-h-screen bg-[#0a0a0f] flex flex-col justify-between overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-20 left-1/4 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-indigo-600/10 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-20 right-1/4 h-[400px] w-[400px] translate-x-1/2 rounded-full bg-cyan-600/10 blur-[100px] pointer-events-none"></div>
      
      {/* Navbar */}
      <Navbar />

      {/* Main Hero & Content */}
      <main className="relative flex-grow flex items-center justify-center py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-12">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/5 px-4 py-1.5 text-xs font-semibold text-indigo-300 animate-pulse">
            <Star className="h-3.5 w-3.5 fill-indigo-400/30 text-indigo-400" />
            Empowering the Next Generation of Founders
          </div>

          {/* Bold Headline */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="font-heading text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-tight">
              Validate. Plan. <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-indigo-500 to-cyan-400 drop-shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                Launch.
              </span>
            </h1>
            <p className="max-w-2xl mx-auto text-base md:text-lg leading-relaxed text-gray-400">
              StartupXpert is an AI-powered startup lifecycle management platform that stress-tests raw ideas, generates technical roadmaps, and drafts compliance documentation.
            </p>
          </div>

          {/* CTA Trigger */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="group relative w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 py-4 text-sm font-bold text-white shadow-[0_0_30px_rgba(99,102,241,0.3)] transition-all duration-300 hover:bg-indigo-500 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(99,102,241,0.5)] focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              Analyze Your Startup Idea
              <ArrowRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-indigo-500/20 bg-indigo-500/5 px-8 py-4 text-sm font-bold text-gray-300 hover:bg-indigo-500/10 hover:text-white transition-all duration-300"
            >
              Login to Workspace
            </Link>
          </div>

          {/* Feature Grid */}
          <section id="features" className="pt-16 max-w-6xl mx-auto">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {features.map((feature, i) => (
                <StepCard
                  key={i}
                  title={feature.title}
                  description={feature.description}
                  icon={feature.icon}
                  badge={feature.badge}
                />
              ))}
            </div>
          </section>

          {/* Social Proof */}
          <div className="pt-8 border-t border-indigo-500/5 max-w-4xl mx-auto flex flex-col sm:flex-row justify-around items-center gap-6 text-gray-500 text-xs tracking-wider uppercase font-semibold">
            <div className="flex items-center gap-2 hover:text-gray-300 transition-colors duration-300">
              <ShieldCheck className="h-4 w-4 text-indigo-400" />
              SaaS Grade Security
            </div>
            <div className="flex items-center gap-2 hover:text-gray-300 transition-colors duration-300">
              <Zap className="h-4 w-4 text-cyan-400" />
              Instant Analysis
            </div>
            <div className="flex items-center gap-2 hover:text-gray-300 transition-colors duration-300">
              <Star className="h-4 w-4 text-indigo-400 fill-indigo-400/20" />
              Founder Focused
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-indigo-500/5 py-8 text-center text-xs text-gray-600 bg-[#08080c]/60">
        &copy; {new Date().getFullYear()} StartupXpert Inc. All rights reserved. Professional Internship Release.
      </footer>
    </div>
  );
};

export default Landing;
