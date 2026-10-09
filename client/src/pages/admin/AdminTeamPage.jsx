import React, { useState, useEffect, useRef } from 'react';
import { cmsService } from '../../services/cmsService';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Music,
  Upload,
  Link2,
  Camera,
  CheckCircle2,
  X,
  User,
} from 'lucide-react';

export const AdminTeamPage = () => {
  const toast = useToast();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [photoMode, setPhotoMode] = useState('upload'); // 'upload' | 'url'
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    category: 'CORE_COMMITTEE',
    instrument: 'Lead Guitar',
    bio: '',
    photo: '',
    usn: '',
    department: 'Computer Science',
    year: 3,
    socialLinks: { instagram: '', linkedin: '', spotify: '', youtube: '' },
    order: 1,
  });

  const fetchTeam = async () => {
    setLoading(true);
    try {
      const res = await cmsService.getTeam();
      if (res.success) setMembers(res.data || []);
    } catch (err) {
      toast.error('Failed to load team.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const handleOpenCreate = () => {
    setEditingMember(null);
    setPhotoMode('upload');
    setFormData({
      name: '',
      role: '',
      category: 'CORE_COMMITTEE',
      instrument: 'Lead Guitar',
      bio: '',
      photo: '',
      usn: '',
      department: 'Computer Science',
      year: 3,
      socialLinks: { instagram: '', linkedin: '', spotify: '', youtube: '' },
      order: members.length + 1,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (m) => {
    setEditingMember(m);
    setPhotoMode(m.photo?.startsWith('/uploads/') ? 'upload' : 'url');
    setFormData({
      name: m.name,
      role: m.role,
      category: m.category,
      instrument: m.instrument || '',
      bio: m.bio || '',
      photo: m.photo || '',
      usn: m.usn || '',
      department: m.department || '',
      year: m.year || 3,
      socialLinks: m.socialLinks || { instagram: '', linkedin: '', spotify: '', youtube: '' },
      order: m.order || 1,
    });
    setModalOpen(true);
  };

  const handlePhotoSelect = async (e) => {
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
        setFormData((prev) => ({ ...prev, photo: res.imageUrl }));
        toast.success('Member photo uploaded from device! 📸');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload photo.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMember) {
        const res = await cmsService.updateTeamMember(editingMember._id, formData);
        if (res.success) toast.success('Team member updated.');
      } else {
        const res = await cmsService.createTeamMember(formData);
        if (res.success) toast.success('Team member added.');
      }
      setModalOpen(false);
      fetchTeam();
    } catch (err) {
      toast.error('Failed to save team member.');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await cmsService.deleteTeamMember(deletingId);
      if (res.success) {
        toast.success('Team member removed.');
        setConfirmDeleteOpen(false);
        fetchTeam();
      }
    } catch (err) {
      toast.error('Failed to remove team member.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <h2 className="text-xl font-bold font-display text-white">Music Club Leadership & Artists</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage faculty coordinators, executive committee, and lead musicians.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-dark-950 font-extrabold text-xs shadow-glow-yellow transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-dark-950 stroke-[3]" />
          <span>Add Team Member</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {members.map((m) => (
          <div
            key={m._id}
            className="glass-panel rounded-2xl overflow-hidden border border-white/10 flex flex-col justify-between group hover:border-amber-500/40 transition-all shadow-lg"
          >
            <div className="h-48 relative overflow-hidden bg-dark-900">
              {m.photo ? (
                <img
                  src={m.photo}
                  alt={m.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-dark-900 text-slate-500">
                  <User className="w-12 h-12 text-slate-600" />
                </div>
              )}
              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-0.5 rounded-full bg-dark-950/85 backdrop-blur-md border border-white/10 text-[10px] font-bold text-amber-300 uppercase">
                  {m.category?.replace('_', ' ')}
                </span>
              </div>
            </div>

            <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-white text-base font-display truncate">{m.name}</h4>
                <p className="text-xs font-bold text-amber-400 truncate">{m.role}</p>
                {m.instrument && (
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                    <Music className="w-3 h-3 text-amber-400" />
                    <span>{m.instrument}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-2.5 border-t border-white/5 text-xs text-slate-400">
                <span className="text-[11px] text-slate-500">
                  {m.department} {m.year ? `• Y${m.year}` : ''}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(m)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="Edit Member"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setDeletingId(m._id);
                      setConfirmDeleteOpen(true);
                    }}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Delete Member"
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
        title={editingMember ? 'Edit Team Member' : 'Add Team Member'}
        subtitle="Artist & Leadership Directory"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-200">Full Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200">Club Role *</label>
              <input
                type="text"
                required
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="e.g. Lead Vocalist, President"
                className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-dark-900 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="CORE_COMMITTEE">Core Executive Committee</option>
                <option value="BAND_LEADS">Band Lead / Section Lead</option>
                <option value="FACULTY">Faculty Coordinator</option>
                <option value="MEMBERS">Active Club Musician</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-200">Instrument / Specialty</label>
            <input
              type="text"
              value={formData.instrument}
              onChange={(e) => setFormData({ ...formData, instrument: e.target.value })}
              placeholder="e.g. Bass Guitar, Drums, Keyboards"
              className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Member Photo with Device Upload */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-200 block">Member Photo *</label>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-dark-900 border border-white/10">
              <button
                type="button"
                onClick={() => setPhotoMode('upload')}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  photoMode === 'upload'
                    ? 'bg-amber-500 text-dark-950 shadow-glow-yellow'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload from Device</span>
              </button>
              <button
                type="button"
                onClick={() => setPhotoMode('url')}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  photoMode === 'url'
                    ? 'bg-amber-500 text-dark-950 shadow-glow-yellow'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>Photo URL</span>
              </button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoSelect}
              accept="image/*"
              className="hidden"
            />

            {photoMode === 'upload' ? (
              <div>
                {formData.photo ? (
                  <div className="relative rounded-2xl overflow-hidden border border-amber-500/40 bg-dark-950 group">
                    <div className="h-40 w-full overflow-hidden">
                      <img src={formData.photo} alt="Member Preview" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
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
                          className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-dark-950 font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Change</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, photo: '' })}
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
                        <span className="text-xs font-bold text-amber-300">Uploading photo from device...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="w-6 h-6 text-amber-400" />
                        <span className="text-xs font-bold text-white">Click to Upload Member Photo from Device</span>
                        <span className="text-[10px] text-slate-400">JPG, PNG, WEBP, Google Photos supported</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="url"
                  value={formData.photo}
                  onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                  placeholder="Paste photo link (Google Photos, Google UserContent, etc.)..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                />
                {formData.photo && (
                  <div className="relative h-32 rounded-xl overflow-hidden border border-white/10 bg-dark-900">
                    <img
                      src={formData.photo}
                      alt="Member Preview"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200">Department</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200">Year</label>
              <input
                type="number"
                min="1"
                max="4"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-200">Bio</label>
            <textarea
              rows={2}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
            />
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
              {editingMember ? 'Save Changes' : 'Add Member'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Team Member"
        message="Are you sure you want to remove this team member?"
        confirmText="Delete"
        isDestructive={true}
      />
    </div>
  );
};
