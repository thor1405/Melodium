import React from 'react';

export const Skeleton = ({ className = '', variant = 'rectangular' }) => {
  const baseClasses = 'animate-pulse bg-white/5';
  const variantClasses = {
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
    text: 'rounded h-4',
  };

  return <div className={`${baseClasses} ${variantClasses[variant] || 'rounded-xl'} ${className}`} />;
};

export const CardSkeleton = () => (
  <div className="glass-panel rounded-2xl p-6 space-y-4">
    <Skeleton className="h-48 w-full" />
    <Skeleton className="h-6 w-3/4" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-1/2" />
  </div>
);

export const SlotSkeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
    {Array.from({ length: 8 }).map((_, i) => (
      <Skeleton key={i} className="h-24 w-full rounded-2xl" />
    ))}
  </div>
);
