import React, { useState, useEffect } from 'react';
import { EventCard } from '../../components/cms/EventCard';
import { cmsService } from '../../services/cmsService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Calendar, Filter, Sparkles } from 'lucide-react';
import { CardSkeleton } from '../../components/common/Skeleton';

export const EventsPage = () => {
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [rsvpdMap, setRsvpdMap] = useState({});

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await cmsService.getEvents({
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        category: categoryFilter !== 'ALL' ? categoryFilter : undefined,
      });

      if (res.success) {
        setEvents(res.data);
      }
    } catch (err) {
      toast.error('Failed to load events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [statusFilter, categoryFilter]);

  const handleRsvp = async (eventId) => {
    if (!isAuthenticated) {
      toast.info('Please log in to RSVP for Melodium events.');
      return;
    }

    try {
      const res = await cmsService.toggleRsvp(eventId);
      if (res.success) {
        toast.success(res.message);
        setRsvpdMap((prev) => ({ ...prev, [eventId]: res.isRsvpd }));
        fetchEvents();
      }
    } catch (err) {
      toast.error('Could not process RSVP.');
    }
  };

  const categories = [
    { label: 'All Categories', value: 'ALL' },
    { label: 'Concerts', value: 'CONCERT' },
    { label: 'Competitions', value: 'COMPETITION' },
    { label: 'Workshops', value: 'WORKSHOP' },
    { label: 'Jam Sessions', value: 'JAM_SESSION' },
    { label: 'Auditions', value: 'AUDITIONS' },
  ];

  return (
    <div className="space-y-10 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
          Melodium SJEC Live
        </span>
        <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-white">
          Live Events, Jams & Competitions
        </h1>
        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
          From high-voltage auditorium battles to sunset acoustic showcases, discover upcoming musical gatherings at SJEC.
        </p>
      </div>

      {/* Filter Tabs & Category Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-4 px-6 glass-panel rounded-2xl border border-white/10">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/5 w-full md:w-auto">
          {['ALL', 'UPCOMING', 'ONGOING', 'COMPLETED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`flex-1 md:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === st
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-dark-950 shadow-glow-yellow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {st === 'ALL' ? 'All Events' : st.charAt(0) + st.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Category Dropdown / Pills */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar">
          {categories.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategoryFilter(c.value)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                categoryFilter === c.value
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                  : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              onRsvp={handleRsvp}
              isRsvpd={rsvpdMap[event._id]}
            />
          ))}
        </div>
      ) : (
        <div className="glass-panel rounded-3xl p-12 text-center text-slate-400 text-sm max-w-md mx-auto space-y-2">
          <Calendar className="w-10 h-10 text-amber-400 mx-auto opacity-60" />
          <div className="font-bold text-white">No Events Found</div>
          <p className="text-xs text-slate-400">
            No events match the selected filters. Try switching the status or category.
          </p>
        </div>
      )}
    </div>
  );
};
