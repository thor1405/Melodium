import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { cmsService } from '../../services/cmsService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatDate, formatSlotRange } from '../../utils/dateUtils';
import {
  Calendar,
  Clock,
  MapPin,
  Heart,
  Share2,
  Users,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const EventDetailPage = () => {
  const { slugOrId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const toast = useToast();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRsvpd, setIsRsvpd] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await cmsService.getEvent(slugOrId);
        if (res.success) {
          setEvent(res.data);
        }
      } catch (err) {
        toast.error('Event not found.');
        navigate('/events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [slugOrId]);

  const handleRsvpToggle = async () => {
    if (!isAuthenticated) {
      toast.info('Please log in to register your RSVP.');
      return;
    }

    try {
      const res = await cmsService.toggleRsvp(event._id);
      if (res.success) {
        setIsRsvpd(res.isRsvpd);
        if (res.isRsvpd) {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
          });
        }
        toast.success(res.message);
        // refresh
        const fresh = await cmsService.getEvent(slugOrId);
        if (fresh.success) setEvent(fresh.data);
      }
    } catch (err) {
      toast.error('Unable to update RSVP.');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event?.title,
        text: event?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Event link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400 text-sm">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        Loading Event Details...
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <Link
        to="/events"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Events</span>
      </Link>

      {/* Hero Poster Banner */}
      <div className="relative rounded-3xl overflow-hidden glass-panel border border-white/10 h-72 sm:h-96">
        <img
          src={event.posterImage || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1000&auto=format&fit=crop'}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/50 to-transparent" />

        <div className="absolute top-6 left-6 flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-dark-950/80 backdrop-blur-md border border-white/15 text-white text-xs font-bold uppercase tracking-wider">
            {event.category}
          </span>
          <span className="px-3 py-1 rounded-full bg-amber-500 text-dark-950 text-xs font-extrabold uppercase">
            {event.status}
          </span>
        </div>

        <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <h1 className="font-display font-extrabold text-2xl sm:text-4xl text-white">
              {event.title}
            </h1>
            {event.tagline && (
              <p className="text-sm font-medium text-amber-300 italic">{event.tagline}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-colors"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleRsvpToggle}
              className={`px-5 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
                isRsvpd
                  ? 'bg-amber-500/30 border border-amber-500/50 text-amber-300 shadow-glow-yellow'
                  : 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-dark-950 font-extrabold shadow-glow-yellow'
              }`}
            >
              <Heart className={`w-4 h-4 ${isRsvpd ? 'fill-amber-400 text-amber-400' : ''}`} />
              <span>{isRsvpd ? 'RSVP Confirmed' : 'RSVP for Event'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Event Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Description & Program */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4">
            <h2 className="font-display font-bold text-xl text-white">About the Event</h2>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </div>

          {event.registrationUrl && (
            <div className="glass-panel-elevated rounded-3xl p-6 border border-amber-500/30 flex items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-white text-sm">Official Registration Link</h4>
                <p className="text-xs text-slate-400">
                  External form / ticketing portal for participants.
                </p>
              </div>
              <a
                href={event.registrationUrl}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-dark-950 font-extrabold text-xs flex items-center gap-1.5 shadow-glow-yellow"
              >
                <span>Register Now</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>

        {/* Right Column: Key Logistics Card */}
        <div className="space-y-6">
          <div className="glass-panel-elevated rounded-3xl p-6 border border-white/10 space-y-4">
            <h3 className="font-display font-bold text-base text-white">Event Logistics</h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Date</span>
                  <span className="font-semibold text-white">
                    {formatDate(event.date, 'EEEE, dd MMMM yyyy')}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Timing</span>
                  <span className="font-semibold text-white">
                    {formatSlotRange(event.startTime, event.endTime)}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Venue</span>
                  <span className="font-semibold text-white">{event.venue}</span>
                  <span className="text-[11px] text-slate-400 block">SJEC Campus, Vamanjoor</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Attendees</span>
                  <span className="font-semibold text-white">
                    {event.rsvps?.length || 0} students attending
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <Link
                to="/jam-room"
                className="w-full block text-center py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-amber-300 font-semibold text-xs border border-white/5 transition-colors"
              >
                Need Rehearsal Time? Book Jam Room
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
