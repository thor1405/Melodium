import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

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

  if (!mounted || typeof document === 'undefined') return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 overflow-y-auto overscroll-contain">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-dark-950/85 backdrop-blur-md z-0"
          />

          {/* Modal Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className={`relative w-full ${maxWidth} max-h-[88vh] sm:max-h-[85vh] flex flex-col glass-panel-elevated rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-white/10 z-10 my-auto`}
          >
            {/* Header */}
            <div className="flex items-start justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-white/10 shrink-0 bg-dark-950/90 backdrop-blur-md">
              <div className="min-w-0 pr-2">
                <h3 className="text-sm sm:text-base font-bold text-white font-display tracking-wide truncate">
                  {title}
                </h3>
                {subtitle && (
                  <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">
                    {subtitle}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 min-h-0 overscroll-contain">
              {children}
            </div>

            {/* Sticky Fixed Footer */}
            {footer && (
              <div className="px-4 py-3 sm:px-6 sm:py-4 border-t border-white/10 shrink-0 bg-dark-950/95 backdrop-blur-md">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};
