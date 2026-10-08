import React from 'react';
import { formatTime12h, formatSlotRange } from '../../utils/dateUtils';
import {
  Clock,
  User,
  CheckCircle2,
  XCircle,
  Ban,
  Shield,
  Eye,
  Plus,
  Radio,
  FileText,
} from 'lucide-react';

export const TodayTimeline = ({
  schedule = [],
  onSelectSlot,
  onApproveBooking,
  onRejectBooking,
  onCancelBooking,
  onBlockSlot,
  onViewBookingDetails,
}) => {
  return (
    <div className="space-y-3">
      {schedule.map((slot) => {
        const isAvailable = slot.status === 'AVAILABLE';
        const isBooked = slot.status === 'BOOKED';
        const isBlocked = slot.status === 'BLOCKED';
        const isPast = slot.status === 'PAST';

        return (
          <div
            key={slot.startTime}
            className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
              isBooked
                ? 'bg-purple-950/20 border-purple-500/20 text-slate-200'
                : isBlocked
                ? 'bg-rose-950/20 border-rose-500/20 text-rose-200'
                : isAvailable
                ? 'bg-emerald-950/15 border-emerald-500/20 text-slate-200'
                : 'bg-white/5 border-white/5 opacity-60 text-slate-400'
            }`}
          >
            {/* Left: Time & Status */}
            <div className="flex items-center gap-4 min-w-[200px]">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center shrink-0">
                <span className="text-xs font-bold font-mono text-brand-gold">
                  {slot.startTime}
                </span>
                <span className="text-[9px] text-slate-400">{slot.endTime}</span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold font-display text-white">
                    {formatSlotRange(slot.startTime, slot.endTime)}
                  </span>
                  {slot.isPast && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-white/10 text-slate-400 uppercase">
                      Past
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-0.5">
                  {isAvailable && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Available for Booking
                    </span>
                  )}
                  {isBooked && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-purple" />
                      Booked {slot.bookingStatus ? `(${slot.bookingStatus})` : ''}
                    </span>
                  )}
                  {isBlocked && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400">
                      <Ban className="w-3.5 h-3.5 text-rose-400" />
                      Blocked by Admin
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Center: Details / Student Info */}
            <div className="flex-1 px-0 md:px-4">
              {isBooked && (
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-white">
                      {slot.student?.name || 'Student Musician'}
                    </span>
                    {slot.student?.usn && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-brand-gold">
                        {slot.student.usn}
                      </span>
                    )}
                    {slot.student?.department && (
                      <span className="text-[10px] text-slate-400">
                        • {slot.student.department}
                      </span>
                    )}
                    {slot.bookingId && (
                      <span className="text-[10px] font-mono text-slate-400">
                        (Ref: {slot.bookingId})
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 italic truncate max-w-md">
                    "{slot.purpose || 'Band Rehearsal'}"
                  </p>
                </div>
              )}

              {isBlocked && (
                <div>
                  <span className="text-xs font-semibold text-rose-300">Reason:</span>{' '}
                  <span className="text-xs text-slate-300">{slot.reason}</span>
                </div>
              )}

              {isAvailable && (
                <span className="text-xs text-slate-400 italic">No reservation active.</span>
              )}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 self-end md:self-center">
              {isBooked && (
                <>
                  {slot.bookingDbId && onViewBookingDetails && (
                    <button
                      onClick={() => onViewBookingDetails(slot.bookingDbId)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                      title="View Booking Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                  {slot.bookingStatus === 'PENDING' && onApproveBooking && (
                    <button
                      onClick={() => onApproveBooking(slot.bookingDbId)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors"
                    >
                      Approve
                    </button>
                  )}
                  {onCancelBooking && (
                    <button
                      onClick={() => onCancelBooking(slot.bookingDbId)}
                      className="px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 text-xs font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </>
              )}

              {isAvailable && (
                <>
                  {onBlockSlot && (
                    <button
                      onClick={() => onBlockSlot(slot)}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-rose-950/40 hover:border-rose-500/30 border border-white/10 text-slate-300 hover:text-rose-300 text-xs font-medium transition-all"
                    >
                      Block Slot
                    </button>
                  )}
                  {onSelectSlot && (
                    <button
                      onClick={() => onSelectSlot(slot)}
                      className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-glow-purple transition-all"
                    >
                      Manual Book
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
