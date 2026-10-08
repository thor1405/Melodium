import React from 'react';
import { formatDate, formatSlotRange, getRelativeTime } from '../../utils/dateUtils';
import { Calendar, Clock, MapPin, CheckCircle, XCircle, AlertCircle, Eye, Trash2 } from 'lucide-react';

export const BookingCard = ({ booking, onViewPass, onCancelBooking }) => {
  const isCancelled = booking.status === 'CANCELLED' || booking.status === 'REJECTED';
  const isCompleted = booking.status === 'COMPLETED';
  const isConfirmed = booking.status === 'CONFIRMED';
  const isPending = booking.status === 'PENDING';

  return (
    <div className="p-5 rounded-2xl glass-panel border border-white/10 hover:border-white/20 transition-all space-y-4 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-brand-gold/15 text-brand-gold border border-brand-gold/20 inline-block mb-1.5">
            {booking.bookingId}
          </span>
          <h4 className="font-display font-bold text-base text-white line-clamp-1">
            {booking.purpose}
          </h4>
        </div>

        {/* Status Tag */}
        <div>
          {isConfirmed && (
            <span className="px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
              Confirmed
            </span>
          )}
          {isCompleted && (
            <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold uppercase tracking-wider">
              Completed
            </span>
          )}
          {isPending && (
            <span className="px-2.5 py-1 rounded-full bg-amber-950/60 border border-amber-500/30 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
              Pending
            </span>
          )}
          {isCancelled && (
            <span className="px-2.5 py-1 rounded-full bg-rose-950/60 border border-rose-500/30 text-rose-300 text-[10px] font-bold uppercase tracking-wider">
              {booking.status}
            </span>
          )}
        </div>
      </div>

      {/* Date & Time */}
      <div className="grid grid-cols-2 gap-2 text-xs py-2 px-3 rounded-xl bg-white/5 border border-white/5">
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="text-slate-200 font-medium truncate">{formatDate(booking.date)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
          <span className="text-slate-200 font-medium truncate">
            {formatSlotRange(booking.startTime, booking.endTime)}
          </span>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <button
          onClick={() => onViewPass(booking)}
          className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>View Studio Pass</span>
        </button>

        {isConfirmed && onCancelBooking && (
          <button
            onClick={() => onCancelBooking(booking)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-rose-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Cancel</span>
          </button>
        )}
      </div>
    </div>
  );
};
