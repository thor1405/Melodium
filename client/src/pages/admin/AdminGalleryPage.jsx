import React, { useState, useEffect, useRef } from 'react';
import { cmsService } from '../../services/cmsService';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  Edit,
  Upload,
  Link2,
  CheckCircle2,
  Sparkles,
  Camera,
  X,
} from 'lucide-react';

export const AdminGalleryPage = () => {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [imageInputMode, setImageInputMode] = useState('upload'); // 'upload' | 'url'
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'PERFORMANCES',
    imageUrl: '',
    caption: '',
    featured: true,
  });

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const res = await cmsService.getGallery();
      if (res.success) setItems(res.data || []);
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
    setImageInputMode('upload');
    setFormData({
      title: '',
      category: 'PERFORMANCES',
      imageUrl: '',
      caption: '',
      featured: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setImageInputMode(item.imageUrl?.startsWith('/uploads/') ? 'upload' : 'url');
    setFormData({
      title: item.title,
      category: item.category,
      imageUrl: item.imageUrl,
      caption: item.caption || '',
      featured: Boolean(item.featured),
    });
    setModalOpen(true);
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (.jpg, .jpeg, .png, .webp, .gif)');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      toast.error('File size exceeds 25MB limit.');
      return;
    }

    const uploadFormData = new FormData();
    uploadFormData.append('photo', file);

    setIsUploading(true);
    try {
      const res = await cmsService.uploadGalleryImage(uploadFormData);
      if (res.success && res.imageUrl) {
        setFormData((prev) => ({
          ...prev,
          imageUrl: res.imageUrl,
          title: prev.title || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
        }));
        toast.success('Photo uploaded from device successfully! 📸');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload photo.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handlePasteUrl = (e) => {
    const text = e.clipboardData?.getData('text')?.trim();
    if (text && (text.startsWith('http://') || text.startsWith('https://'))) {
      setFormData((prev) => ({
        ...prev,
        imageUrl: text,
      }));
      setImageInputMode('url');
      toast.success('Pasted image link detected!');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.imageUrl.trim()) {
      toast.error('Please upload a photo from your device or provide an image URL.');
      return;
    }

    try {
      if (editingItem) {
        const res = await cmsService.updateGalleryItem(editingItem._id, formData);
        if (res.success) toast.success('Photo updated successfully.');
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
            Upload and manage high-resolution concert, festival, and jam room photos.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-dark-950 font-extrabold text-xs shadow-glow-yellow transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 text-dark-950 stroke-[3]" />
          <span>Add Photo to Gallery</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div
            key={item._id}
            className="glass-panel rounded-2xl overflow-hidden border border-white/10 flex flex-col justify-between group hover:border-amber-500/40 transition-all shadow-lg"
          >
            <div className="h-48 relative overflow-hidden bg-dark-900">
              <img
                src={item.imageUrl}
                alt={item.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-0.5 rounded-full bg-dark-950/85 backdrop-blur-md border border-white/10 text-[10px] font-bold text-amber-300 uppercase">
                  {item.category?.replace('_', ' ')}
                </span>
              </div>
            </div>

            <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-white text-sm font-display truncate">{item.title}</h4>
                {item.caption && <p className="text-xs text-slate-400 line-clamp-2 mt-1">{item.caption}</p>}
              </div>

              <div className="flex items-center justify-between pt-2.5 border-t border-white/5 text-xs text-slate-400">
                <span className="text-[11px] text-slate-400">{item.featured ? '⭐ Featured' : 'Gallery'}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="Edit Photo"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setDeletingId(item._id);
                      setConfirmDeleteOpen(true);
                    }}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Delete Photo"
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
        title={editingItem ? 'Edit Gallery Photo' : 'Add Photo to Gallery'}
        subtitle="Performance & Studio Photography"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmit} onPaste={handlePasteUrl} className="space-y-4">
          {/* Photo Source Selector Tabs */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-200 block">Photo Media *</label>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-dark-900 border border-white/10">
              <button
                type="button"
                onClick={() => setImageInputMode('upload')}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  imageInputMode === 'upload'
                    ? 'bg-amber-500 text-dark-950 shadow-glow-yellow'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload from Device</span>
              </button>
              <button
                type="button"
                onClick={() => setImageInputMode('url')}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  imageInputMode === 'url'
                    ? 'bg-amber-500 text-dark-950 shadow-glow-yellow'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>Image Web URL</span>
              </button>
            </div>
          </div>

          {/* Hidden Device File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
            className="hidden"
          />

          {/* Upload Dropzone / Live Preview Box */}
          {imageInputMode === 'upload' ? (
            <div>
              {formData.imageUrl ? (
                /* Uploaded Preview State */
                <div className="relative rounded-2xl overflow-hidden border border-amber-500/40 bg-dark-950 shadow-inner group">
                  <div className="h-44 w-full overflow-hidden">
                    <img
                      src={formData.imageUrl}
                      alt="Gallery Preview"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-950/95 via-dark-950/30 to-transparent flex items-end justify-between p-3.5">
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-dark-950/80 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Photo Ready</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-dark-950 font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer transition-all"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Change Photo</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, imageUrl: '' })}
                        className="p-1.5 rounded-lg bg-dark-950/80 hover:bg-rose-950/80 text-slate-300 hover:text-rose-400 border border-white/10 cursor-pointer transition-colors"
                        title="Remove"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Dropzone State */
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all space-y-2 group ${
                    isUploading
                      ? 'border-amber-400/50 bg-amber-500/5 pointer-events-none'
                      : 'border-white/15 hover:border-amber-400/60 bg-white/5 hover:bg-amber-500/5'
                  }`}
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-2 py-4">
                      <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-bold text-amber-300">Uploading photo from device...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2.5">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform shadow-glow-yellow">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">
                          Click to Browse Photo from Device
                        </span>
                        <span className="text-[11px] text-slate-400 mt-0.5 block">
                          Supports JPG, PNG, WEBP, Google Photos & URLs (Up to 25MB)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* URL Input Mode */
            <div className="space-y-2">
              <input
                type="url"
                required
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="Paste photo link (Google Photos, Google UserContent, Unsplash, Imgur, etc.)..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-all"
              />
              {formData.imageUrl && (
                <div className="relative h-36 rounded-xl overflow-hidden border border-white/10 bg-dark-900">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.classList.add('opacity-40');
                    }}
                  />
                  <div className="absolute bottom-2 right-2 bg-dark-950/80 px-2 py-1 rounded text-[10px] text-slate-300 border border-white/10">
                    Live URL Preview
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Photo Title */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-200">Photo Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Annual Band Showcase 2026"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-all"
            />
          </div>

          {/* Category */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-200">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-dark-900 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="PERFORMANCES">Live Performances</option>
              <option value="JAM_SESSIONS">Jam Room Sessions</option>
              <option value="COMPETITIONS">Battle of the Bands / Competitions</option>
              <option value="COLLEGE_EVENTS">College Events / Fests</option>
              <option value="BEHIND_THE_SCENES">Behind The Scenes / Audio Engineering</option>
            </select>
          </div>

          {/* Caption */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-200">Caption / Notes</label>
            <textarea
              rows={2}
              value={formData.caption}
              onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
              placeholder="Brief description of the performance or gear used..."
              className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-all"
            />
          </div>

          {/* Featured on Home Toggle */}
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2 text-xs text-slate-300">
            <input
              type="checkbox"
              id="featured-photo"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              className="rounded border-slate-700 bg-dark-900 text-amber-500 focus:ring-0 cursor-pointer"
            />
            <label htmlFor="featured-photo" className="cursor-pointer text-xs select-none text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Feature on Melodium Homepage Gallery</span>
            </label>
          </div>

          {/* Modal Footer Buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || !formData.imageUrl}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-dark-950 font-extrabold text-xs shadow-glow-yellow transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              <span>{editingItem ? 'Update Photo' : 'Save Photo'}</span>
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
