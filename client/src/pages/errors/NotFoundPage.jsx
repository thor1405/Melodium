import React from 'react';
import { Link } from 'react-router-dom';
import { Music2, ArrowLeft, Home } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-brand-purple/20 border border-brand-purple/30 flex items-center justify-center mx-auto text-brand-gold">
          <Music2 className="w-10 h-10 text-brand-gold animate-bounce" />
        </div>
        <div className="space-y-2">
          <h1 className="text-5xl font-display font-black text-white">404</h1>
          <h2 className="text-xl font-bold text-slate-200">Track Not Found</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            to="/"
            className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-glow-purple flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Return to Melodium Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
