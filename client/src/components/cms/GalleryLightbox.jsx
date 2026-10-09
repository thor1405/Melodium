import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';

export const GalleryLightbox = ({ items = [] }) => {
  const [selectedIndex, setSelectedIndex] = useState(null);

  const selectedItem = selectedIndex !== null ? items[selectedIndex] : null;

  const handleNext = () => {
    setSelectedIndex((prev) => (prev + 1) % items.length);
  };

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  return (
    <>
      {/* Masonry / Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, idx) => (
          <motion.div
            key={item._id}
            whileHover={{ y: -5 }}
            onClick={() => setSelectedIndex(idx)}
            className="group relative rounded-3xl overflow-hidden glass-panel border border-white/10 cursor-pointer aspect-[4/3] sm:aspect-auto sm:h-80"
          >
            <img
              src={item.imageUrl}
              alt={item.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-950/90 via-dark-950/30 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

            {/* Category Tag */}
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 rounded-full bg-dark-950/80 backdrop-blur-md border border-white/15 text-white text-[10px] font-bold uppercase tracking-wider">
                {item.category?.replace('_', ' ')}
              </span>
            </div>

            {/* Hover Icon */}
            <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-dark-950/70 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <ZoomIn className="w-4 h-4 text-brand-gold" />
            </div>

            {/* Bottom Caption */}
            <div className="absolute bottom-4 left-4 right-4 space-y-1">
              <h4 className="font-display font-bold text-base text-white group-hover:text-amber-400 transition-colors truncate">
                {item.title}
              </h4>
              <div className="text-xs text-slate-400">
                <span>{item.location || 'SJEC'}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedIndex(null)}
              className="fixed inset-0 bg-dark-950/90 backdrop-blur-xl"
            />

            {/* Lightbox Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-5xl w-full max-h-[90vh] glass-panel-elevated rounded-3xl overflow-hidden border border-white/10 z-10 flex flex-col lg:flex-row"
            >
              {/* Image Area */}
              <div className="relative flex-1 bg-black/40 flex items-center justify-center min-h-[350px] lg:min-h-[500px]">
                <img
                  src={selectedItem.imageUrl}
                  alt={selectedItem.title}
                  referrerPolicy="no-referrer"
                  className="max-h-[75vh] w-full object-contain p-2"
                />

                {/* Left/Right controls */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-dark-950/70 hover:bg-dark-950 text-white border border-white/10 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-dark-950/70 hover:bg-dark-950 text-white border border-white/10 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Sidebar Info */}
              <div className="w-full lg:w-80 p-6 flex flex-col justify-between space-y-4 border-t lg:border-t-0 lg:border-l border-white/10 bg-dark-900/90">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold uppercase text-amber-300">
                      {selectedItem.category?.replace('_', ' ')}
                    </span>
                    <button
                      onClick={() => setSelectedIndex(null)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <h3 className="font-display font-bold text-lg text-white">
                      {selectedItem.title}
                    </h3>
                    {selectedItem.caption && (
                      <p className="text-xs text-slate-400 leading-relaxed mt-2">
                        {selectedItem.caption}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-end">
                  <span className="text-xs text-slate-500">
                    {selectedIndex + 1} of {items.length}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
