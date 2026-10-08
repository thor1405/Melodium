import React, { useState, useEffect } from 'react';
import { cmsService } from '../../services/cmsService';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { formatDate, formatSlotRange, getTodayString, getLocalDateString } from '../../utils/dateUtils';
import { Calendar, Plus, Edit, Trash2, MapPin, Clock, Heart } from 'lucide-react';

export const AdminEventsPage = () => {
  const toast = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    tagline: '',
    description: '',
    category: 'CONCERT',
    venue: 'Kalam Auditorium, SJEC',
    date: getTodayString(),
    startTime: '17:00',
    endTime: '19:30',
    status: 'UPCOMING',
    posterImage: '',
    registrationUrl: '',
    featured: false,
  });

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await cmsService.getEvents();
      if (res.success) setEvents(res.data);
    } catch (err) {
      toast.error('Failed to load events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleOpenCreate = () => {
    setEditingEvent(null);
    setFormData({
      title: '',
      tagline: '',
      description: '',
      category: 'CONCERT',
      venue: 'Kalam Auditorium, SJEC',
      date: getTodayString(),
      startTime: '17:00',
      endTime: '19:30',
      status: 'UPCOMING',
      posterImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1000&auto=format&fit=crop',
      registrationUrl: '',
      featured: false,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      tagline: event.tagline || '',
      description: event.description,
      category: event.category,
      venue: event.venue,
      date: event.date ? getLocalDateString(event.date) : '',
      startTime: event.startTime,
      endTime: event.endTime,
      status: event.status,
      posterImage: event.posterImage,
      registrationUrl: event.registrationUrl || '',
      featured: Boolean(event.featured),
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        const res = await cmsService.updateEvent(editingEvent._id, formData);
        if (res.success) toast.success('Event updated successfully.');
      } else {
        const res = await cmsService.createEvent(formData);
        if (res.success) toast.success('Event created successfully.');
      }
      setModalOpen(false);
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save event.');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await cmsService.deleteEvent(deletingId);
      if (res.success) {
        toast.success('Event deleted.');
        setConfirmDeleteOpen(false);
        fetchEvents();
      }
    } catch (err) {
      toast.error('Failed to delete event.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <h2 className="text-xl font-bold font-display text-white">Events & Concerts CMS</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Create, edit and manage upcoming shows, workshops, and competitions.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-dark-950 font-extrabold text-xs shadow-glow-yellow transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Music Event</span>
        </button>
      </div>

      {/* Events List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((ev) => (
          <div
            key={ev._id}
            className="glass-panel rounded-2xl overflow-hidden border border-white/10 flex flex-col justify-between"
          >
            <div className="h-44 relative">
              <img src={ev.posterImage} alt={ev.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/40 to-transparent" />
              <div className="absolute top-3 left-3 flex gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-dark-950/80 text-[10px] font-bold text-white uppercase">
                  {ev.category}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-[10px] font-bold text-dark-950 uppercase">
                  {ev.status}
                </span>
              </div>
            </div>

            <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-1">
                <h4 className="font-bold text-white text-base font-display">{ev.title}</h4>
                <div className="text-xs text-slate-400">
                  {formatDate(ev.date)} • {formatSlotRange(ev.startTime, ev.endTime)}
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-brand-gold" />
                  <span>{ev.venue}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-rose-400" />
                  {ev.rsvps?.length || 0} RSVPs
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(ev)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setDeletingId(ev._id);
                      setConfirmDeleteOpen(true);
                    }}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingEvent ? 'Edit Music Event' : 'Create New Event'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-200">Event Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-purple"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-200">Tagline / Subtitle</label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-purple"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-dark-900 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-purple"
              >
                <option value="CONCERT">Concert / Live Show</option>
                <option value="COMPETITION">Battle of the Bands / Competition</option>
                <option value="WORKSHOP">Workshop / Masterclass</option>
                <option value="JAM_SESSION">Open Mic / Acoustic Jam</option>
                <option value="AUDITIONS">Club Auditions</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-dark-900 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-purple"
              >
                <option value="UPCOMING">Upcoming</option>
                <option value="ONGOING">Ongoing / Live</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200">Date *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-purple"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200">Start Time</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-purple"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200">End Time</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-purple"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-200">Venue</label>
            <input
              type="text"
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-purple"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-200">Poster Image URL</label>
            <input
              type="url"
              value={formData.posterImage}
              onChange={(e) => setFormData({ ...formData, posterImage: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-purple"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-200">Description *</label>
            <textarea
              rows={3}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-purple"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="featured"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              className="rounded border-slate-700 bg-dark-900 text-amber-500"
            />
            <label htmlFor="featured" className="text-xs text-slate-300">
              Pin as Featured Event on Homepage
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-dark-950 font-extrabold text-xs shadow-glow-yellow"
            >
              {editingEvent ? 'Save Changes' : 'Create Event'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Event"
        message="Are you sure you want to permanently delete this event?"
        confirmText="Delete"
        isDestructive={true}
      />
    </div>
  );
};
