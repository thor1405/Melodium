import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';

export const ForbiddenPage = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-5xl font-display font-black text-white">403</h1>
          <h2 className="text-xl font-bold text-slate-200">Access Denied</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            You do not have administrative clearance to access the Melodium SJEC executive console.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            to="/"
            className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-glow-purple flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Return to Public Website</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
