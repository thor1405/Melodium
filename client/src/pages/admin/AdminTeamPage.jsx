import React, { useState, useEffect } from 'react';
import { cmsService } from '../../services/cmsService';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Users, Plus, Edit, Trash2, Music } from 'lucide-react';

export const AdminTeamPage = () => {
  const toast = useToast();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

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
      if (res.success) setMembers(res.data);
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
    setFormData({
      name: '',
      role: '',
      category: 'CORE_COMMITTEE',
      instrument: 'Lead Guitar',
      bio: '',
      photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=500&auto=format&fit=crop',
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
          <h2 className="text-xl font-bold font-display text-white">Club Committee & Leads CMS</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage faculty coordinator, club executives, band leads, and section captains.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-dark-950 font-extrabold text-xs shadow-glow-yellow transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Member / Lead</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((m) => (
          <div
            key={m._id}
            className="glass-panel rounded-2xl overflow-hidden border border-white/10 flex flex-col justify-between"
          >
            <div className="p-5 flex items-center gap-4 border-b border-white/5">
              <img
                src={m.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop'}
                alt={m.name}
                className="w-14 h-14 rounded-2xl object-cover border border-white/10"
              />
              <div className="space-y-0.5">
                <h4 className="font-bold text-white text-base font-display">{m.name}</h4>
                <div className="text-xs font-semibold text-brand-gold">{m.role}</div>
                <div className="text-[10px] text-slate-400 uppercase">{m.category?.replace('_', ' ')}</div>
              </div>
            </div>

            <div className="p-4 space-y-2 flex-1 flex flex-col justify-between text-xs">
              <div className="space-y-1">
                <div className="text-slate-300 font-medium">{m.instrument}</div>
                <p className="text-slate-400 line-clamp-2">{m.bio}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/5 text-slate-400">
                <span>{m.department}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(m)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setDeletingId(m._id);
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
        title={editingMember ? 'Edit Team Member' : 'Add Team Member'}
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
              className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-purple"
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
                placeholder="e.g. President, Band Lead"
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
                <option value="CORE_COMMITTEE">Core Executive Committee</option>
                <option value="BAND_LEADS">Band Lead / Section Lead</option>
                <option value="FACULTY">Faculty Coordinator</option>
                <option value="MEMBERS">Active Club Musician</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200">Instrument / Tech Role</label>
              <input
                type="text"
                value={formData.instrument}
                onChange={(e) => setFormData({ ...formData, instrument: e.target.value })}
                placeholder="e.g. Lead Guitarist"
                className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-purple"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200">Photo URL</label>
              <input
                type="url"
                value={formData.photo}
                onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-purple"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200">Department</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-purple"
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
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-purple"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200">Display Order</label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-purple"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-200">Short Bio</label>
            <textarea
              rows={2}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
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
              Save Member
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Remove Team Member"
        message="Are you sure you want to remove this member?"
        confirmText="Remove"
        isDestructive={true}
      />
    </div>
  );
};
