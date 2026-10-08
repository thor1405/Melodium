import React from 'react';
import { Music, Radio, Calendar, Search } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = Music,
  title = 'No items found',
  description = 'There are currently no records or entries matching your criteria.',
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`glass-panel rounded-2xl p-10 text-center flex flex-col items-center justify-center max-w-md mx-auto ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-purple mb-4">
        <Icon className="w-7 h-7 text-brand-purple" />
      </div>
      <h4 className="text-base font-bold text-white mb-1 font-display">{title}</h4>
      <p className="text-xs text-slate-400 leading-relaxed max-w-xs mb-6">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all shadow-glow-purple"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
