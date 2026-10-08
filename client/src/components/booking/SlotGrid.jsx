import React from 'react';
import { formatTime12h } from '../../utils/dateUtils';
import { Clock, CheckCircle2, Lock, Ban, Plus, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export const SlotGrid = ({
  slots = [],
  selectedSlots = [],
  onToggleSlot = () => {},
}) => {
  if (slots.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-8 text-center text-slate-400 text-sm">
        No time slots available for this date.
      </div>
    );
  }

  const isSlotSelected = (slot) => {
    return selectedSlots.some((s) => s.startTime === slot.startTime);
  };

  return (
    <div className="space-y-4">
      {/* Legend & Multi-Select Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-2.5 px-4 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300">
        <div className="flex flex-wrap items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-glow-emerald" />
            <span className="font-medium text-emerald-300">Available (Click to Select)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-glow-yellow" />
            <span className="font-bold text-amber-300">Selected ({selectedSlots.length})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-glow-yellow" />
            <span className="font-medium text-amber-300">Booked</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span>Blocked</span>
          </div>
          <div className="flex items-center gap-1.5 opacity-60">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
            <span>Past</span>
          </div>
        </div>

        {selectedSlots.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-amber-300 text-xs font-semibold">
              💡 {selectedSlots.length} {selectedSlots.length === 1 ? 'slot' : 'slots'} chosen for this day
            </span>
          </div>
        )}
      </div>

      {/* Slots Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
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
              'bg-gradient-to-br from-amber-500/25 via-amber-900/40 to-dark-900 border-amber-400 shadow-glow-yellow text-white scale-[1.02] ring-2 ring-amber-400/80 cursor-pointer';
            badge = (
              <span className="px-2 py-0.5 rounded-md bg-amber-400 text-dark-950 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 shadow-sm">
                <Check className="w-3 h-3 stroke-[3]" /> Selected
              </span>
            );
          } else if (isAvailable) {
            cardStyle =
              'bg-emerald-950/20 hover:bg-emerald-950/40 border-emerald-500/30 hover:border-amber-400 hover:shadow-glow-yellow text-slate-200 cursor-pointer transition-all hover:scale-[1.01]';
            badge = (
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <Plus className="w-2.5 h-2.5" /> Available
              </span>
            );
          } else if (isBooked) {
            cardStyle =
              'bg-dark-900/70 border-amber-500/20 text-slate-300 cursor-not-allowed';
            badge = (
              <span
                className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm"
              >
                <Lock className="w-2.5 h-2.5 text-amber-400" />
                {slot.isMine ? 'Your Booking' : 'Booked'}
              </span>
            );
          } else if (isBlocked) {
            cardStyle =
              'bg-slate-900/80 border-slate-700 text-slate-400 cursor-not-allowed';
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
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.015 }}
              onClick={() => {
                if (isAvailable) onToggleSlot(slot);
              }}
              className={`p-4 rounded-2xl border backdrop-blur-md relative flex flex-col justify-between min-h-[115px] select-none ${cardStyle}`}
            >
              {/* Header */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                  <Clock className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-300' : 'text-amber-400'}`} />
                  <span>1 Hour Session</span>
                </div>
                {badge}
              </div>

              {/* Timing Display */}
              <div className="my-2">
                <div className="font-display font-bold text-lg text-white">
                  {formatTime12h(slot.startTime)}
                </div>
                <div className="text-[11px] text-slate-400">
                  to {formatTime12h(slot.endTime)}
                </div>
              </div>

              {/* Sub-label */}
              <div className="text-[11px] truncate">
                {isSelected && (
                  <span className="text-amber-300 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Selected • Click to deselect
                  </span>
                )}
                {!isSelected && isAvailable && (
                  <span className="text-emerald-400 font-medium">Click to select slot</span>
                )}
                {isBooked && (
                  <span className="text-amber-400/80 font-medium">
                    {slot.isMine
                      ? 'Pass issued to you'
                      : slot.student?.name
                      ? `Booked by ${slot.student.name}`
                      : 'Booked Band Session'}
                  </span>
                )}
                {isBlocked && (
                  <span className="text-slate-400 truncate block">
                    {slot.reason || 'Maintenance / College Event'}
                  </span>
                )}
                {isPast && <span className="text-slate-500">Session Expired</span>}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
