import React, { useState, useEffect } from 'react';
import { GalleryLightbox } from '../../components/cms/GalleryLightbox';
import { cmsService } from '../../services/cmsService';
import { useToast } from '../../context/ToastContext';
import { Image, Camera } from 'lucide-react';
import { CardSkeleton } from '../../components/common/Skeleton';

export const GalleryPage = () => {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const res = await cmsService.getGallery({
        category: category !== 'ALL' ? category : undefined,
      });
      if (res.success) setItems(res.data);
    } catch (err) {
      toast.error('Failed to load gallery photos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, [category]);

  const categories = [
    { label: 'All Photos', value: 'ALL' },
    { label: 'Studio Gear & Room', value: 'STUDIO_GEAR' },
    { label: 'Jam Sessions', value: 'JAM_SESSIONS' },
    { label: 'Live Performances', value: 'PERFORMANCES' },
    { label: 'Behind The Scenes', value: 'BEHIND_THE_SCENES' },
    { label: 'Battle of the Bands', value: 'COMPETITIONS' },
    { label: 'College Events', value: 'COLLEGE_EVENTS' },
  ];

  return (
    <div className="space-y-10 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
          Visual Memories
        </span>
        <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-white">
          Performance & Studio Gallery
        </h1>
        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
          High-energy guitar solos, drum breakdowns, acoustic sunset jams, and backstage sound checks at St. Joseph Engineering College.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {categories.map((c) => (
          <button
            key={c.value}
            onClick={() => setCategory(c.value)}
            className={`flex-shrink-0 px-4 py-2 rounded-2xl text-xs font-bold border transition-all ${
              category === c.value
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-dark-950 border-amber-400 shadow-glow-yellow scale-105'
                : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:border-white/10'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Gallery Grid / Lightbox */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : items.length > 0 ? (
        <GalleryLightbox items={items} />
      ) : (
        <div className="glass-panel rounded-3xl p-12 text-center text-slate-400 text-sm max-w-md mx-auto space-y-2">
          <Camera className="w-10 h-10 text-amber-400 mx-auto opacity-60" />
          <div className="font-bold text-white">No Photos In This Category</div>
          <p className="text-xs text-slate-400">
            Check back later as new photos from upcoming concerts are uploaded.
          </p>
        </div>
      )}
    </div>
  );
};
