import React from 'react';
import { Link } from 'react-router-dom';
import { Satellite, ArrowLeft, Space } from 'lucide-react';
import Navbar from '../components/Navbar';

const NotFound = () => {
  return (
    <div className="relative min-h-screen bg-[#0a0a0f] flex flex-col justify-between overflow-hidden">
      
      {/* Starry deep space background orbs */}
      <div className="absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/3 left-1/3 h-[250px] w-[250px] -translate-x-1/2 rounded-full bg-cyan-500/5 blur-[80px] pointer-events-none"></div>
      
      <Navbar />

      <main className="flex-grow flex flex-col items-center justify-center py-16 px-4 text-center z-10 relative">
        <div className="space-y-8 max-w-lg mx-auto">
          {/* Animated Satellite Icon */}
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 animate-float shadow-[0_0_30px_rgba(99,102,241,0.15)]">
            <Satellite className="h-12 w-12 text-indigo-400" />
          </div>

          {/* Heading */}
          <div className="space-y-3">
            <h1 className="font-heading text-4xl md:text-5xl font-black text-white leading-none">
              404 — Drifting in Space
            </h1>
            <p className="text-sm md:text-base leading-relaxed text-gray-500 max-w-sm mx-auto">
              You've drifted beyond the verified StartupXpert orbit. This stellar system doesn't exist.
            </p>
          </div>

          {/* Action CTA Button */}
          <div className="pt-2">
            <Link
              to="/"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-4 text-sm font-bold text-white shadow-[0_0_20px_rgba(99,102,241,0.2)] hover:bg-indigo-500 transition-all duration-300 hover:shadow-[0_0_30px_rgba(99,102,241,0.4)]"
            >
              <ArrowLeft className="h-4.5 w-4.5 transition-transform group-hover:-translate-x-1" />
              Return to Base Base
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-indigo-500/5 py-6 text-center text-xs text-gray-600 bg-[#08080c]/60">
        &copy; {new Date().getFullYear()} StartupXpert deep space explorer unit.
      </footer>
    </div>
  );
};

export default NotFound;
