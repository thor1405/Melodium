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
            className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 ${
              isBooked
                ? 'bg-amber-500/5 border-amber-500/20 text-slate-200'
                : isBlocked
                ? 'bg-rose-950/20 border-rose-500/20 text-rose-200'
                : isAvailable
                ? 'bg-emerald-950/15 border-emerald-500/20 text-slate-200'
                : 'bg-white/5 border-white/5 opacity-60 text-slate-400'
            }`}
          >
            {/* Top/Left: Time & Status */}
            <div className="flex items-center gap-3 min-w-0 md:min-w-[200px]">
              <div className="w-12 h-12 rounded-xl bg-dark-900/80 border border-white/10 flex flex-col items-center justify-center shrink-0 shadow-inner">
                <span className="text-xs font-bold font-mono text-amber-400">
                  {slot.startTime}
                </span>
                <span className="text-[9px] text-slate-400">{slot.endTime}</span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-sm font-bold font-display text-white">
                    {formatSlotRange(slot.startTime, slot.endTime)}
                  </span>
                  {slot.isPast && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-slate-400 uppercase">
                      Past
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 mt-0.5">
                  {isAvailable && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                      Available
                    </span>
                  )}
                  {isBooked && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      Booked {slot.bookingStatus ? `(${slot.bookingStatus})` : ''}
                    </span>
                  )}
                  {isBlocked && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400">
                      <Ban className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      Blocked
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Center: Details / Student Info */}
            <div className="flex-1 min-w-0">
              {isBooked && (
                <div className="space-y-1 bg-white/5 md:bg-transparent p-2.5 md:p-0 rounded-xl border border-white/5 md:border-0">
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="font-bold text-white">
                      {slot.student?.name || 'Student Musician'}
                    </span>
                    {slot.student?.usn && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 font-bold">
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
                        ({slot.bookingId})
                      </span>
                    )}
                  </div>
                  {slot.purpose && (
                    <p className="text-[11px] text-slate-300 italic truncate">
                      "{slot.purpose}"
                    </p>
                  )}
                </div>
              )}

              {isBlocked && (
                <div className="text-xs bg-rose-950/30 md:bg-transparent p-2 md:p-0 rounded-xl border border-rose-500/10 md:border-0">
                  <span className="font-semibold text-rose-300">Reason:</span>{' '}
                  <span className="text-slate-300">{slot.reason || 'Maintenance'}</span>
                </div>
              )}

              {isAvailable && (
                <span className="hidden md:inline text-xs text-slate-400 italic">No reservation active.</span>
              )}
            </div>

            {/* Right/Bottom: Actions */}
            <div className="flex items-center gap-2 pt-2 md:pt-0 border-t border-white/5 md:border-t-0 justify-end flex-wrap">
              {isBooked && (
                <>
                  {slot.bookingDbId && onViewBookingDetails && (
                    <button
                      onClick={() => onViewBookingDetails(slot.bookingDbId)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title="View Booking Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                  {slot.bookingStatus === 'PENDING' && onApproveBooking && (
                    <button
                      onClick={() => onApproveBooking(slot.bookingDbId)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors cursor-pointer"
                    >
                      Approve
                    </button>
                  )}
                  {onCancelBooking && (
                    <button
                      onClick={() => onCancelBooking(slot.bookingDbId)}
                      className="px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </>
              )}

              {isAvailable && (
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {onBlockSlot && (
                    <button
                      onClick={() => onBlockSlot(slot)}
                      className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl bg-white/5 hover:bg-rose-950/40 hover:border-rose-500/30 border border-white/10 text-slate-300 hover:text-rose-300 text-xs font-medium transition-all text-center cursor-pointer"
                    >
                      Block
                    </button>
                  )}
                  {onSelectSlot && (
                    <button
                      onClick={() => onSelectSlot(slot)}
                      className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-dark-950 font-bold text-xs shadow-sm transition-all text-center cursor-pointer"
                    >
                      Manual Book
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
