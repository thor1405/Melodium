import React from 'react';
import { formatDate, formatTime12h, formatSlotRange } from '../../utils/dateUtils';
import { MelodiumLogo } from '../common/MelodiumLogo';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Radio,
  Share2,
} from 'lucide-react';

export const BookingPassCard = ({ booking, onCancel }) => {
  if (!booking) return null;

  const isCancelled = booking.status === 'CANCELLED';
  const isPending = booking.status === 'PENDING';
  const isConfirmed = booking.status === 'CONFIRMED' || booking.status === 'COMPLETED';

  return (
    <div className="relative rounded-3xl overflow-hidden glass-panel-elevated border border-white/10 shadow-2xl p-6 sm:p-8">
      {/* Top Background Ambient Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Pass Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-3">
          <MelodiumLogo className="w-12 h-12" showGlow={true} />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-extrabold text-lg text-white">MELODIUM STUDIO</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                SJEC
              </span>
            </div>
            <p className="text-xs text-slate-400">Official Jam Room Reservation Pass</p>
          </div>
        </div>

        {/* Status Badge */}
        <div>
          {isConfirmed && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold shadow-glow-emerald">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {booking.status === 'COMPLETED' ? 'COMPLETED' : 'CONFIRMED'}
            </span>
          )}
          {isPending && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs font-bold">
              <Clock className="w-3.5 h-3.5" /> PENDING APPROVAL
            </span>
          )}
          {isCancelled && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-xs font-bold">
              <XCircle className="w-3.5 h-3.5" /> CANCELLED
            </span>
          )}
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-6 border-b border-white/10 relative z-10">
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">
            Pass Reference ID
          </span>
          <span className="font-mono text-base font-extrabold text-amber-400 tracking-wide">
            {booking.bookingId}
          </span>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">
            Date
          </span>
          <div className="flex items-center gap-1.5 text-sm font-bold text-white">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>{formatDate(booking.date, 'EEEE, dd MMM yyyy')}</span>
          </div>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">
            Time Slot (1 Hour)
          </span>
          <div className="flex items-center gap-1.5 text-sm font-bold text-white">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>{formatSlotRange(booking.startTime, booking.endTime)}</span>
          </div>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">
            Campus Venue
          </span>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Academic Block 3, Ground Flr</span>
          </div>
        </div>
      </div>

      {/* Booker & Student Full Profile Details */}
      <div className="py-5 space-y-4 relative z-10">
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
            Student & Booker Details
          </span>
          <span
            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
              booking.userType === 'OUTSIDER' || booking.feeAmount > 0
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            }`}
          >
            {booking.userType === 'OUTSIDER' || booking.feeAmount > 0
              ? 'External Musician (₹500 Paid via Stripe)'
              : 'SJEC Student (Free Pass)'}
          </span>
        </div>

        {/* Student Data Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {/* Name */}
          <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              Booker / Student Name
            </span>
            <div className="font-bold text-white text-sm truncate">
              {booking.bookerName || booking.userId?.name || 'Musician'}
            </div>
          </div>

          {/* USN / Student ID */}
          <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              USN / Organization
            </span>
            <div className="font-mono font-bold text-amber-300 text-sm">
              {booking.userId?.usn || (booking.userId?.organization ? booking.userId.organization : 'N/A')}
            </div>
          </div>

          {/* Phone Number */}
          <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              Phone Number
            </span>
            <div className="font-semibold text-white text-sm">
              {booking.userId?.phone ? (
                <a href={`tel:${booking.userId.phone}`} className="hover:text-amber-400 transition-colors">
                  {booking.userId.phone}
                </a>
              ) : (
                <span className="text-slate-500 font-normal">Not provided</span>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              Email Address
            </span>
            <div className="text-slate-200 truncate font-mono text-[11px]">
              {booking.userId?.email ? (
                <a href={`mailto:${booking.userId.email}`} className="hover:text-amber-400 transition-colors">
                  {booking.userId.email}
                </a>
              ) : (
                'N/A'
              )}
            </div>
          </div>

          {/* Department / Branch or Payment Info */}
          <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1 sm:col-span-2 lg:col-span-2">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              {booking.userType === 'OUTSIDER' || booking.feeAmount > 0 ? 'Stripe Payment Verification' : 'Department & Year'}
            </span>
            <div className="text-slate-200 truncate">
              {booking.userType === 'OUTSIDER' || booking.feeAmount > 0 ? (
                <span className="font-mono text-emerald-400 font-semibold text-[11px]">
                  ₹{booking.feeAmount || 500} Confirmed via Stripe • ID: {booking.stripePaymentIntentId || 'Verified'}
                </span>
              ) : (
                <>
                  {booking.userId?.department || 'Computer Science & Engineering'}
                  {booking.userId?.year ? ` (Year ${booking.userId.year})` : ''}
                  {booking.userId?.city ? ` • ${booking.userId.city}` : ''}
                </>
              )}
            </div>
          </div>
        </div>

        {booking.participants && booking.participants.length > 0 && (
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">
              Registered Band Members ({booking.participantCount || booking.participants.length})
            </span>
            <div className="flex flex-wrap gap-1.5">
              {booking.participants.map((p, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-xs text-slate-300 font-medium"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer / Cancel Button */}
      {onCancel && isConfirmed && (
        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Need to reschedule? Cancellation available up to 2 hours prior.
          </span>
          <button
            onClick={() => onCancel(booking)}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:text-white bg-rose-950/30 hover:bg-rose-900/50 border border-rose-500/30 transition-all"
          >
            Cancel Session
          </button>
        </div>
      )}
    </div>
  );
};
