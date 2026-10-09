import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate, formatTime12h, formatSlotRange } from '../../utils/dateUtils';
import { Calendar, Clock, MapPin, Users, ArrowRight, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

export const EventCard = ({ event, onRsvp, isRsvpd }) => {
  if (!event) return null;

  const isCompleted = event.status === 'COMPLETED';
  const isOngoing = event.status === 'ONGOING';
  const isUpcoming = event.status === 'UPCOMING';

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="glass-panel rounded-3xl overflow-hidden border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between group"
    >
      {/* Event Poster */}
      <div className="relative h-52 sm:h-56 overflow-hidden">
        <img
          src={event.posterImage || '/gallery/sound_treated_live_room.png'}
          alt={event.title}
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.target.src = '/gallery/sound_treated_live_room.png';
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/40 to-transparent" />

        {/* Category & Status Badges */}
        <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-dark-950/80 backdrop-blur-md border border-white/15 text-white text-[10px] font-bold uppercase tracking-wider">
            {event.category}
          </span>
          {event.featured && (
            <span className="px-2.5 py-1 rounded-full bg-amber-500 text-dark-950 text-[10px] font-extrabold uppercase tracking-wider">
              Featured
            </span>
          )}
        </div>

        {/* Status Tag */}
        <div className="absolute top-4 right-4">
          {isOngoing && (
            <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-dark-950 text-[10px] font-extrabold uppercase flex items-center gap-1.5 shadow-glow-emerald">
              <span className="w-1.5 h-1.5 rounded-full bg-dark-950 animate-ping" />
              Live Now
            </span>
          )}
          {isCompleted && (
            <span className="px-2.5 py-1 rounded-full bg-dark-950/90 text-slate-400 text-[10px] font-bold uppercase border border-white/10">
              Concluded
            </span>
          )}
        </div>

        {/* Event Date Pill */}
        <div className="absolute bottom-3 left-4 flex items-center gap-2 text-xs font-semibold text-brand-gold">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatDate(event.date, 'EEEE, dd MMM yyyy')}</span>
        </div>
      </div>

      {/* Body Details */}
      <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <h3 className="font-display font-extrabold text-xl text-white group-hover:text-amber-400 transition-colors leading-tight">
            {event.title}
          </h3>
          {event.tagline && (
            <p className="text-xs font-medium text-amber-300 italic">{event.tagline}</p>
          )}
          <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
            {event.description}
          </p>
        </div>

        <div className="space-y-2 pt-2 border-t border-white/5">
          {/* Timing & Venue */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{formatSlotRange(event.startTime, event.endTime)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-yellow-400" />
              <span className="truncate max-w-[140px]">{event.venue}</span>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-3 gap-2">
            {onRsvp ? (
              <button
                onClick={() => onRsvp(event._id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isRsvpd
                    ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                    : 'bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${isRsvpd ? 'fill-amber-400 text-amber-400' : ''}`} />
                <span>{isRsvpd ? 'Going' : 'RSVP'}</span>
                <span className="text-[10px] text-slate-500">
                  ({(event.rsvps?.length || 0) + (isRsvpd ? 1 : 0)})
                </span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span>{event.rsvps?.length || 0} Attending</span>
              </div>
            )}

            <Link
              to={`/events/${event.slug || event._id}`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
            >
              <span>Explore</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
