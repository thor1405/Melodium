import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 'max-w-lg',
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-dark-950/85 backdrop-blur-md"
          />

          {/* Modal Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`relative w-full ${maxWidth} max-h-[92vh] sm:max-h-[85vh] flex flex-col glass-panel-elevated rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-white/10 z-10 my-auto`}
          >
            {/* Header */}
            <div className="flex items-start justify-between px-3.5 py-2.5 sm:px-5 sm:py-3.5 border-b border-white/10 shrink-0 bg-dark-950/85 backdrop-blur-md">
              <div className="min-w-0 pr-2">
                <h3 className="text-sm sm:text-base font-bold text-white font-display tracking-wide truncate">{title}</h3>
                {subtitle && <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                className="p-1 sm:p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-3 sm:p-5 overflow-y-auto flex-1 min-h-0 overscroll-contain">{children}</div>

            {/* Sticky Fixed Footer */}
            {footer && (
              <div className="px-3.5 py-2.5 sm:px-5 sm:py-3.5 border-t border-white/10 shrink-0 bg-dark-950/95 backdrop-blur-md">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
