import React from 'react';
import { formatTime12h } from '../../utils/dateUtils';
import { Clock, CheckCircle2, Lock, Ban, Plus, Check, Zap, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const SlotGrid = ({
  slots = [],
  selectedSlots = [],
  onToggleSlot = () => {},
  onOpenBookingModal = () => {},
}) => {
  if (slots.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-6 sm:p-8 text-center text-slate-400 text-xs sm:text-sm">
        No time slots available for this date.
      </div>
    );
  }

  const isSlotSelected = (slot) => {
    return selectedSlots.some((s) => s.startTime === slot.startTime);
  };

  return (
    <div className="space-y-3.5 sm:space-y-4">
      {/* Legend & Multi-Select Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 py-2.5 px-3 sm:px-4 rounded-xl bg-white/5 border border-white/5 text-[11px] sm:text-xs text-slate-300">
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-400 shadow-glow-emerald" />
            <span className="font-medium text-emerald-300">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-amber-400 shadow-glow-yellow" />
            <span className="font-bold text-amber-300">Selected ({selectedSlots.length})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-amber-400/50" />
            <span className="text-slate-400">Booked</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-rose-500/80" />
            <span className="text-slate-400">Blocked</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-amber-300/90 text-[11px] font-medium">
          <span>💡 Tap multiple slots to select consecutive hours</span>
        </div>
      </div>

      {/* Slots Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {slots.map((slot, idx) => {
          const isSelected = isSlotSelected(slot);
          const isAvailable = slot.status === 'AVAILABLE';
          const isBooked = slot.status === 'BOOKED';
          const isBlocked = slot.status === 'BLOCKED';
          const isPast = slot.status === 'PAST';

          let cardStyle = 'bg-white/5 border-white/10 text-slate-400 cursor-not-allowed opacity-60';
          let badge = null;

          if (isSelected) {
            cardStyle =
              'bg-gradient-to-br from-amber-500/25 via-amber-950/50 to-dark-900 border-2 border-amber-400 shadow-glow-yellow text-white ring-2 ring-amber-400/40 cursor-pointer';
            badge = (
              <span className="px-2 py-0.5 rounded-md bg-amber-400 text-dark-950 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 shadow-sm">
                <Check className="w-3 h-3 stroke-[3]" /> Selected
              </span>
            );
          } else if (isAvailable) {
            cardStyle =
              'bg-emerald-950/20 hover:bg-emerald-950/40 border border-emerald-500/30 hover:border-amber-400 hover:shadow-glow-yellow text-slate-200 cursor-pointer transition-all active:scale-[0.98]';
            badge = (
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <Plus className="w-2.5 h-2.5" /> Available
              </span>
            );
          } else if (isBooked) {
            cardStyle =
              'bg-dark-900/70 border border-amber-500/20 text-slate-300 cursor-not-allowed';
            badge = (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm">
                <Lock className="w-2.5 h-2.5 text-amber-400" />
                {slot.isMine ? 'Your Booking' : 'Booked'}
              </span>
            );
          } else if (isBlocked) {
            cardStyle =
              'bg-slate-900/80 border border-slate-700 text-slate-400 cursor-not-allowed';
            badge = (
              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <Ban className="w-2.5 h-2.5" /> Blocked
              </span>
            );
          } else if (isPast) {
            badge = (
              <span className="px-2 py-0.5 rounded-md bg-white/5 text-slate-500 text-[10px] font-bold uppercase">
                Past
              </span>
            );
          }

          return (
            <motion.div
              key={slot.startTime}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.01 }}
              onClick={() => {
                if (isAvailable || isSelected) onToggleSlot(slot);
              }}
              className={`p-3.5 sm:p-4 rounded-2xl backdrop-blur-md relative flex flex-col justify-between min-h-[135px] select-none transition-all ${cardStyle}`}
            >
              {/* Header */}
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                    <Clock className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-300' : 'text-amber-400'}`} />
                    <span>1 Hour Session</span>
                  </div>
                  {badge}
                </div>

                {/* Timing Display */}
                <div className="my-2">
                  <div className="font-display font-black text-lg sm:text-xl text-white tracking-wide">
                    {formatTime12h(slot.startTime)}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    until {formatTime12h(slot.endTime)}
                  </div>
                </div>
              </div>

              {/* Action / State Area */}
              <div className="pt-2 border-t border-white/5">
                {isSelected ? (
                  <div className="flex items-center justify-between text-[11px] text-amber-300 font-bold py-1">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> Selected
                    </span>
                    <span className="text-[10px] text-amber-300/70 font-normal">
                      Tap to unselect
                    </span>
                  </div>
                ) : isAvailable ? (
                  <div className="flex items-center justify-between text-[11px] text-emerald-400 font-semibold py-1">
                    <span className="flex items-center gap-1">
                      <Plus className="w-3 h-3" /> Tap to select
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      Multi-select enabled
                    </span>
                  </div>
                ) : isBooked ? (
                  <div className="text-[11px] text-amber-400/80 font-semibold truncate py-1 text-center">
                    {slot.isMine
                      ? 'Pass issued to you'
                      : slot.student?.name
                      ? `Booked by ${slot.student.name}`
                      : 'Reserved Session'}
                  </div>
                ) : isBlocked ? (
                  <div className="text-[11px] text-slate-400 truncate py-1 text-center">
                    {slot.reason || 'Blocked by Admin'}
                  </div>
                ) : isPast ? (
                  <div className="text-[11px] text-slate-500 py-1 text-center font-medium">
                    Session Expired
                  </div>
                ) : null}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
