import React, { useState, useEffect } from 'react';
import { cmsService } from '../../services/cmsService';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Image, Plus, Trash2, Edit, Eye } from 'lucide-react';

export const AdminGalleryPage = () => {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'PERFORMANCES',
    imageUrl: '',
    caption: '',
    eventDate: 'October 2026',
    location: 'SJEC Campus',
    featured: true,
  });

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const res = await cmsService.getGallery();
      if (res.success) setItems(res.data);
    } catch (err) {
      toast.error('Failed to load gallery.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      category: 'PERFORMANCES',
      imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format&fit=crop',
      caption: '',
      eventDate: 'October 2026',
      location: 'Kalam Auditorium',
      featured: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      category: item.category,
      imageUrl: item.imageUrl,
      caption: item.caption || '',
      eventDate: item.eventDate || '',
      location: item.location || '',
      featured: Boolean(item.featured),
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        const res = await cmsService.updateGalleryItem(editingItem._id, formData);
        if (res.success) toast.success('Photo updated.');
      } else {
        const res = await cmsService.createGalleryItem(formData);
        if (res.success) toast.success('Photo added to gallery.');
      }
      setModalOpen(false);
      fetchGallery();
    } catch (err) {
      toast.error('Failed to save photo.');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await cmsService.deleteGalleryItem(deletingId);
      if (res.success) {
        toast.success('Photo removed.');
        setConfirmDeleteOpen(false);
        fetchGallery();
      }
    } catch (err) {
      toast.error('Failed to delete photo.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <h2 className="text-xl font-bold font-display text-white">Performance Gallery CMS</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Add and manage high-resolution concert and jam room photos.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-dark-950 font-extrabold text-xs shadow-glow-yellow transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Upload Photo</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div
            key={item._id}
            className="glass-panel rounded-2xl overflow-hidden border border-white/10 flex flex-col justify-between"
          >
            <div className="h-48 relative">
              <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-0.5 rounded-full bg-dark-950/80 text-[10px] font-bold text-white uppercase">
                  {item.category?.replace('_', ' ')}
                </span>
              </div>
            </div>

            <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-white text-sm font-display truncate">{item.title}</h4>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1">{item.caption}</p>
              </div>

              <div className="flex items-center justify-end pt-2 border-t border-white/5 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setDeletingId(item._id);
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

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? 'Edit Gallery Item' : 'Add Photo to Gallery'}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-200">Photo Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-purple"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-200">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-dark-900 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-purple"
            >
              <option value="PERFORMANCES">Live Performances</option>
              <option value="JAM_SESSIONS">Jam Room Sessions</option>
              <option value="COMPETITIONS">Battle of the Bands / Competitions</option>
              <option value="COLLEGE_EVENTS">College Events / Fests</option>
              <option value="BEHIND_THE_SCENES">Behind The Scenes / Audio Engineering</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-200">Image URL *</label>
            <input
              type="url"
              required
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-purple"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200">Event Date</label>
              <input
                type="text"
                value={formData.eventDate}
                onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                placeholder="e.g. October 2026"
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-purple"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Kalam Auditorium"
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-purple"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-200">Caption</label>
            <textarea
              rows={2}
              value={formData.caption}
              onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-purple"
            />
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
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-dark-950 font-extrabold text-xs shadow-glow-yellow"
            >
              Save Photo
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Gallery Photo"
        message="Are you sure you want to delete this photo?"
        confirmText="Delete"
        isDestructive={true}
      />
    </div>
  );
};
