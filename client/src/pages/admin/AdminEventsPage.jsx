import React, { useState, useEffect, useRef } from 'react';
import { cmsService } from '../../services/cmsService';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { formatDate, formatSlotRange, getTodayString, getLocalDateString } from '../../utils/dateUtils';
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  MapPin,
  Clock,
  Heart,
  Upload,
  Link2,
  Camera,
  CheckCircle2,
  X,
  Sparkles,
} from 'lucide-react';

export const AdminEventsPage = () => {
  const toast = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [posterMode, setPosterMode] = useState('upload'); // 'upload' | 'url'
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

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
      if (res.success) setEvents(res.data || []);
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
    setPosterMode('upload');
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
      posterImage: '',
      registrationUrl: '',
      featured: false,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (event) => {
    setEditingEvent(event);
    setPosterMode(event.posterImage?.startsWith('/uploads/') ? 'upload' : 'url');
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
      posterImage: event.posterImage || '',
      registrationUrl: event.registrationUrl || '',
      featured: Boolean(event.featured),
    });
    setModalOpen(true);
  };

  const handlePosterSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (.jpg, .jpeg, .png, .webp, .gif)');
      return;
    }

    const uploadFormData = new FormData();
    uploadFormData.append('photo', file);

    setIsUploading(true);
    try {
      const res = await cmsService.uploadGalleryImage(uploadFormData);
      if (res.success && res.imageUrl) {
        setFormData((prev) => ({ ...prev, posterImage: res.imageUrl }));
        toast.success('Event poster uploaded from device! 📸');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload event poster.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
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
      toast.error('Failed to save event.');
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
            Publish college concerts, band battles, acoustic jams, and music workshops.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-dark-950 font-extrabold text-xs shadow-glow-yellow transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-dark-950 stroke-[3]" />
          <span>Create Event</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((ev) => (
          <div
            key={ev._id}
            className="glass-panel rounded-2xl overflow-hidden border border-white/10 flex flex-col justify-between group hover:border-amber-500/40 transition-all shadow-lg"
          >
            <div className="h-48 relative overflow-hidden bg-dark-900">
              {ev.posterImage ? (
                <img
                  src={ev.posterImage}
                  alt={ev.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-dark-900 text-slate-500 text-xs">
                  No Poster
                </div>
              )}
              <div className="absolute top-3 left-3 flex gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-dark-950/85 backdrop-blur-md border border-white/10 text-[10px] font-bold text-amber-300 uppercase">
                  {ev.category}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-dark-950/85 backdrop-blur-md border border-white/10 text-[10px] font-bold text-emerald-400 uppercase">
                  {ev.status}
                </span>
              </div>
            </div>

            <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-white text-base font-display truncate">{ev.title}</h4>
                {ev.tagline && <p className="text-xs text-amber-300/80 font-medium truncate">{ev.tagline}</p>}
                <p className="text-xs text-slate-400 line-clamp-2 mt-1">{ev.description}</p>
              </div>

              <div className="space-y-1 text-xs text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>{formatDate(ev.date, 'EEEE, dd MMM yyyy')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>{formatSlotRange(ev.startTime, ev.endTime)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span className="truncate">{ev.venue}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs text-slate-400">
                <div className="flex items-center gap-1 text-slate-300">
                  <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/20" />
                  <span>{ev.rsvpsCount || 0} RSVPs</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(ev)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="Edit Event"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setDeletingId(ev._id);
                      setConfirmDeleteOpen(true);
                    }}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Delete Event"
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
        subtitle="Concert & Performance Information"
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
              placeholder="e.g. Battle of the Bands 2026"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-200">Tagline / Subtitle</label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              placeholder="e.g. Annual SJEC Inter-Department Music Showdown"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-dark-900 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
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
                className="w-full px-3.5 py-2.5 rounded-xl bg-dark-900 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="UPCOMING">Upcoming</option>
                <option value="ONGOING">Ongoing / Live</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>

          {/* Event Poster Image with Device Upload */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-200 block">Event Poster *</label>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-dark-900 border border-white/10">
              <button
                type="button"
                onClick={() => setPosterMode('upload')}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  posterMode === 'upload'
                    ? 'bg-amber-500 text-dark-950 shadow-glow-yellow'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload from Device</span>
              </button>
              <button
                type="button"
                onClick={() => setPosterMode('url')}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  posterMode === 'url'
                    ? 'bg-amber-500 text-dark-950 shadow-glow-yellow'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>Poster URL</span>
              </button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePosterSelect}
              accept="image/*"
              className="hidden"
            />

            {posterMode === 'upload' ? (
              <div>
                {formData.posterImage ? (
                  <div className="relative rounded-2xl overflow-hidden border border-amber-500/40 bg-dark-950 group">
                    <div className="h-40 w-full overflow-hidden">
                      <img src={formData.posterImage} alt="Poster Preview" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-950/95 via-dark-950/30 to-transparent flex items-end justify-between p-3.5">
                      <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-dark-950/80 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Poster Ready</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                          className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-dark-950 font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Change</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, posterImage: '' })}
                          className="p-1.5 rounded-lg bg-dark-950/80 text-slate-300 hover:text-rose-400 border border-white/10 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all space-y-2 ${
                      isUploading ? 'border-amber-400/50 bg-amber-500/5' : 'border-white/15 hover:border-amber-400/60 bg-white/5 hover:bg-amber-500/5'
                    }`}
                  >
                    {isUploading ? (
                      <div className="flex flex-col items-center gap-2 py-2">
                        <div className="w-7 h-7 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs font-bold text-amber-300">Uploading poster from device...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="w-6 h-6 text-amber-400" />
                        <span className="text-xs font-bold text-white">Click to Upload Event Poster from Device</span>
                        <span className="text-[10px] text-slate-400">JPG, PNG, WEBP supported</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <input
                type="url"
                value={formData.posterImage}
                onChange={(e) => setFormData({ ...formData, posterImage: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
              />
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200">Date *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200">Start Time</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200">End Time</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-200">Venue</label>
            <input
              type="text"
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-200">Description *</label>
            <textarea
              rows={3}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2 text-xs text-slate-300">
            <input
              type="checkbox"
              id="featured"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              className="rounded border-slate-700 bg-dark-900 text-amber-500 cursor-pointer"
            />
            <label htmlFor="featured" className="text-xs text-slate-200 cursor-pointer flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Pin as Featured Event on Homepage</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-dark-950 font-extrabold text-xs shadow-glow-yellow transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
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
