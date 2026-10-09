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
  Sliders,
  Sparkles,
  Headphones,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminTeamPage = () => {
  const toast = useToast();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [photoMode, setPhotoMode] = useState('upload'); // 'upload' | 'url'
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const engineerFileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    category: 'SOUND_ENGINEER',
    instrument: 'Live Sound, Multitrack DAW & Studio Acoustics',
    bio: '',
    photo: '',
    usn: '',
    department: 'Studio Audio Engineering',
    year: 4,
    socialLinks: { instagram: '', linkedin: '', spotify: '', youtube: '' },
    order: 1,
  });

  const fetchTeam = async () => {
    setLoading(true);
    try {
      const res = await cmsService.getTeam();
      if (res.success) setMembers(res.data || []);
    } catch (err) {
      toast.error('Failed to load team data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const soundEngineer = members.find(
    (m) =>
      m.category === 'SOUND_ENGINEER' ||
      m.name?.toLowerCase().includes('lionel') ||
      m.role?.toLowerCase().includes('sound')
  );

  const handleOpenCreate = () => {
    setEditingMember(null);
    setPhotoMode('upload');
    setFormData({
      name: '',
      role: '',
      category: 'CORE_COMMITTEE',
      instrument: '',
      bio: '',
      photo: '',
      usn: '',
      department: '',
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
      name: m.name || '',
      role: m.role || '',
      category: m.category || 'SOUND_ENGINEER',
      instrument: m.instrument || '',
      bio: m.bio || '',
      photo: m.photo || '',
      usn: m.usn || '',
      department: m.department || '',
      year: m.year || 4,
      socialLinks: m.socialLinks || { instagram: '', linkedin: '', spotify: '', youtube: '' },
      order: m.order || 1,
    });
    setModalOpen(true);
  };

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (.jpg, .jpeg, .png, .webp, .gif)');
      return;
    }

    const uploadFormData = new FormData();
    uploadFormData.append('photo', file);

    setIsUploading(true);
    try {
      const res = await cmsService.uploadTeamPhoto(uploadFormData);
      if (res.success && res.imageUrl) {
        setFormData((prev) => ({ ...prev, photo: res.imageUrl }));
        toast.success('Photo uploaded from device! 📸');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload photo.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Dedicated 1-Click Upload for Sound Engineer Spotlight Card
  const handleEngineerPhotoUpload = async (e) => {
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
      const uploadRes = await cmsService.uploadTeamPhoto(uploadFormData);
      if (uploadRes.success && uploadRes.imageUrl) {
        if (soundEngineer) {
          await cmsService.updateTeamMember(soundEngineer._id, {
            ...soundEngineer,
            photo: uploadRes.imageUrl,
          });
          toast.success("Lionel's Sound Engineer photo updated & live on Homepage! 🎧✨");
          fetchTeam();
        } else {
          await cmsService.createTeamMember({
            name: 'Lionel',
            role: 'Sound Engineer & Studio Custodian',
            category: 'SOUND_ENGINEER',
            instrument: 'Live Sound, Multitrack DAW & Studio Acoustics',
            bio: 'Official Resident Sound Engineer for Melodium SJEC. Manages live rehearsal acoustics, multitrack studio recording, digital mixing console routing, and audio calibration at Jam Room (Academic Block 3).',
            photo: uploadRes.imageUrl,
            department: 'Studio Audio Engineering',
          });
          toast.success("Sound Engineer profile created & photo uploaded! 🎧✨");
          fetchTeam();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload photo.');
    } finally {
      setIsUploading(false);
      if (engineerFileInputRef.current) engineerFileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMember) {
        const res = await cmsService.updateTeamMember(editingMember._id, formData);
        if (res.success) toast.success('Team member updated successfully.');
      } else {
        const res = await cmsService.createTeamMember(formData);
        if (res.success) toast.success('Team member added successfully.');
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

  const categories = [
    { id: 'ALL', label: 'All Members' },
    { id: 'SOUND_ENGINEER', label: 'Sound Engineer' },
    { id: 'CORE_COMMITTEE', label: 'Core Committee' },
    { id: 'BAND_LEADS', label: 'Band Leads' },
    { id: 'FACULTY', label: 'Faculty Coordinators' },
    { id: 'MEMBERS', label: 'Musicians' },
  ];

  const filteredMembers = members.filter((m) => {
    if (selectedCategory === 'ALL') return true;
    return m.category === selectedCategory;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Headphones className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black font-display text-white">
              Sound Engineer & Leadership CMS
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage Lionel’s Sound Engineer spotlight photo, faculty advisors, executive committee, and club artists.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchTeam}
            disabled={loading}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-dark-950 font-extrabold text-xs shadow-glow-yellow transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5 text-dark-950 stroke-[3]" />
            <span>Add Member / Lead</span>
          </button>
        </div>
      </div>

      {/* 2. SOUND ENGINEER SPOTLIGHT HERO CARD */}
      <section className="glass-panel-elevated rounded-3xl p-6 sm:p-8 border border-amber-500/30 bg-gradient-to-br from-dark-900/90 via-dark-950 to-dark-900 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          {/* Left: Sound Engineer Photo & Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 w-full lg:w-auto">
            {/* Photo with Overlay Edit Button */}
            <div className="relative group shrink-0">
              <div className="w-36 h-48 sm:w-44 sm:h-56 rounded-2xl overflow-hidden border-2 border-amber-500/40 bg-dark-900 shadow-xl relative">
                <img
                  src={soundEngineer?.photo || '/team/lionel.jpg'}
                  alt={soundEngineer?.name || 'Lionel'}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.target.src = '/team/lionel.jpg';
                  }}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-950/90 via-dark-950/20 to-transparent" />
                <div className="absolute bottom-2 left-2 right-2 text-center">
                  <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider bg-dark-950/80 px-2 py-0.5 rounded-md border border-amber-500/30">
                    Live Photo
                  </span>
                </div>
              </div>

              {/* Hidden File Input for 1-Click Upload */}
              <input
                type="file"
                ref={engineerFileInputRef}
                onChange={handleEngineerPhotoUpload}
                accept="image/*"
                className="hidden"
              />
            </div>

            {/* Sound Engineer Details */}
            <div className="space-y-3 text-center sm:text-left flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
                <Sliders className="w-3.5 h-3.5" />
                <span>Featured Homepage & Studio Sound Engineer</span>
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-display font-black text-white">
                  {soundEngineer?.name || 'Lionel'}
                </h3>
                <p className="text-xs sm:text-sm font-bold text-amber-400 mt-0.5">
                  {soundEngineer?.role || 'Chief Sound Engineer & Studio Custodian'}
                </p>
                <p className="text-xs text-slate-300 mt-2 max-w-xl line-clamp-3 leading-relaxed">
                  {soundEngineer?.bio ||
                    'Official Resident Sound Engineer for Melodium SJEC. Manages live rehearsal acoustics, multitrack studio recording, digital mixing console routing, and audio calibration at Jam Room.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 text-[11px] text-slate-400">
                <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-slate-300">
                  🎧 {soundEngineer?.instrument || 'Live Sound & Multitrack DAW'}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-slate-300">
                  📍 {soundEngineer?.department || 'Studio Audio Engineering'}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Quick Action Buttons for Sound Engineer */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-white/10">
            <button
              onClick={() => engineerFileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-dark-950 font-extrabold text-xs shadow-glow-yellow transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-dark-950 border-t-transparent rounded-full animate-spin" />
                  <span>Uploading Photo...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 text-dark-950 stroke-[2.5]" />
                  <span>Upload Photo from Computer</span>
                </>
              )}
            </button>

            {soundEngineer && (
              <button
                onClick={() => handleOpenEdit(soundEngineer)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5 text-amber-400" />
                <span>Edit Profile & Bio</span>
              </button>
            )}

            <Link
              to="/sound-engineer"
              target="_blank"
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-transparent hover:bg-white/5 text-slate-400 hover:text-slate-200 font-medium text-xs transition-all flex items-center justify-center gap-1.5"
            >
              <ExternalLink className="w-3 h-3 text-amber-400" />
              <span>Preview Public Page</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-amber-500 text-dark-950 shadow-glow-yellow'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 4. Full Team Directory Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading team & artist directory...</p>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-white/10 rounded-3xl p-8 bg-dark-900/40">
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No members found in this category</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Click "Add Member / Lead" to populate your music club roster.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMembers.map((m) => (
            <div
              key={m._id}
              className={`glass-panel rounded-2xl overflow-hidden border transition-all flex flex-col justify-between group shadow-lg ${
                m.category === 'SOUND_ENGINEER'
                  ? 'border-amber-500/40 bg-gradient-to-b from-dark-900 to-dark-950 shadow-amber-500/5'
                  : 'border-white/10 hover:border-amber-500/30'
              }`}
            >
              {/* Photo */}
              <div className="h-52 relative overflow-hidden bg-dark-900">
                {m.photo ? (
                  <img
                    src={m.photo}
                    alt={m.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.target.src = '/team/lionel.jpg';
                    }}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-dark-900 text-slate-500">
                    <User className="w-12 h-12 text-slate-600" />
                  </div>
                )}

                <div className="absolute top-3 left-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase backdrop-blur-md border shadow-md ${
                      m.category === 'SOUND_ENGINEER'
                        ? 'bg-amber-500 text-dark-950 border-amber-400'
                        : 'bg-dark-950/85 text-amber-300 border-white/10'
                    }`}
                  >
                    {m.category?.replace('_', ' ')}
                  </span>
                </div>

                {m.category === 'SOUND_ENGINEER' && (
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-0.5 rounded-md bg-dark-950/90 text-amber-400 text-[10px] font-bold border border-amber-500/30 flex items-center gap-1">
                      <Sliders className="w-3 h-3" />
                      Studio Lead
                    </span>
                  </div>
                )}
              </div>

              {/* Member Meta */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <h4 className="font-bold text-white text-base font-display truncate">{m.name}</h4>
                  <p className="text-xs font-bold text-amber-400 truncate">{m.role}</p>
                  {m.instrument && (
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-1 truncate">
                      <Music className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>{m.instrument}</span>
                    </p>
                  )}
                  {m.bio && <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{m.bio}</p>}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs text-slate-400">
                  <span className="text-[11px] text-slate-500 truncate max-w-[140px]">
                    {m.department} {m.year ? `• Y${m.year}` : ''}
                  </span>

                  <div className="flex items-center gap-1.5 shrink-0">
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
      )}

      {/* 5. Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingMember ? `Edit ${editingMember.name}` : 'Add New Team Member'}
        subtitle="Artist & Sound Engineer Directory"
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
              placeholder="e.g. Lionel"
              className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200">Role / Title *</label>
              <input
                type="text"
                required
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="e.g. Sound Engineer & Studio Custodian"
                className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-dark-900 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="SOUND_ENGINEER">Sound Engineer (Lionel / Lead)</option>
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
              placeholder="e.g. Live Sound, Multitrack DAW, Drums, Vocals"
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
                    <div className="h-44 w-full overflow-hidden">
                      <img
                        src={formData.photo}
                        alt="Member Preview"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.target.src = '/team/lionel.jpg';
                        }}
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
                      isUploading
                        ? 'border-amber-400/50 bg-amber-500/5'
                        : 'border-white/15 hover:border-amber-400/60 bg-white/5 hover:bg-amber-500/5'
                    }`}
                  >
                    {isUploading ? (
                      <div className="flex flex-col items-center gap-2 py-2">
                        <div className="w-7 h-7 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs font-bold text-amber-300">
                          Uploading photo from device...
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="w-6 h-6 text-amber-400" />
                        <span className="text-xs font-bold text-white">
                          Click to Upload Member Photo from Device
                        </span>
                        <span className="text-[10px] text-slate-400">
                          JPG, PNG, WEBP, Google Photos supported (Up to 25MB)
                        </span>
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
                  placeholder="Paste direct photo link (https://...)..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                />
                {formData.photo && (
                  <div className="relative h-32 rounded-xl overflow-hidden border border-white/10 bg-dark-900">
                    <img
                      src={formData.photo}
                      alt="Member Preview"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.target.src = '/team/lionel.jpg';
                      }}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200">Department / Role Area</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="e.g. Studio Audio Engineering"
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200">Year / Experience</label>
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
            <label className="text-xs font-semibold text-slate-200">Bio & Studio Description</label>
            <textarea
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Describe their sound engineering role, live audio skills, or club responsibilities..."
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

      {/* 6. Delete Confirmation */}
      <ConfirmDialog
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Team Member"
        message="Are you sure you want to remove this team member from the Melodium roster?"
        confirmText="Delete"
        isDestructive={true}
      />
    </div>
  );
};

export default AdminTeamPage;
