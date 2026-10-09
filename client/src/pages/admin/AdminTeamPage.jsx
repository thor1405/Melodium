import React, { useState, useEffect, useRef } from 'react';
import { cmsService } from '../../services/cmsService';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/common/Modal';
import {
  Upload,
  Link2,
  Camera,
  CheckCircle2,
  X,
  Sliders,
  Sparkles,
  Headphones,
  ExternalLink,
  Save,
  RefreshCw,
  Plus,
  Trash2,
  Edit3,
  Layers,
  Image as ImageIcon,
  Check,
  AlertCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminTeamPage = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'equipment'

  // --- Sound Engineer State ---
  const [engineer, setEngineer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [photoMode, setPhotoMode] = useState('upload'); // 'upload' | 'url'
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: 'Lionel',
    role: 'Chief Sound Engineer & Studio Custodian',
    instrument: 'Live Sound Mixing, Multitrack DAW & Studio Acoustics',
    bio: 'Lionel oversees all audio engineering, sound checks, and studio operations at Melodium SJEC. From calibrating 16-channel digital consoles and dialing in studio monitor acoustics to running multitrack DAW recording sessions for student bands and external artists, Lionel ensures every performance is captured with studio clarity.',
    photo: '/team/lionel.jpg',
  });

  // --- Equipment State ---
  const [equipmentList, setEquipmentList] = useState([]);
  const [loadingEquip, setLoadingEquip] = useState(false);
  const [editingGear, setEditingGear] = useState(null); // null when closed, gear object when open
  const [isNewGear, setIsNewGear] = useState(false);
  const [isSavingGear, setIsSavingGear] = useState(false);
  const [gearUploadLoading, setGearUploadLoading] = useState(false);
  const [gearPhotoMode, setGearPhotoMode] = useState('upload');
  const gearFileInputRef = useRef(null);

  const [gearFormData, setGearFormData] = useState({
    title: '',
    tag: 'Mixer Console',
    desc: '',
    image: '',
    order: 0,
    isActive: true,
  });

  // Fetch Sound Engineer Profile
  const fetchEngineer = async () => {
    setLoading(true);
    try {
      const res = await cmsService.getTeam();
      if (res.success && res.data && res.data.length > 0) {
        const found =
          res.data.find(
            (m) =>
              m.category === 'SOUND_ENGINEER' ||
              m.name?.toLowerCase().includes('lionel') ||
              m.role?.toLowerCase().includes('sound')
          ) || res.data[0];

        if (found) {
          setEngineer(found);
          setFormData({
            name: found.name || 'Lionel',
            role: found.role || 'Chief Sound Engineer & Studio Custodian',
            instrument: found.instrument || 'Live Sound Mixing, Multitrack DAW & Studio Acoustics',
            bio: found.bio || '',
            photo: found.photo || '/team/lionel.jpg',
          });
        }
      }
    } catch (err) {
      toast.error('Failed to load sound engineer profile.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Equipment Gear
  const fetchEquipment = async () => {
    setLoadingEquip(true);
    try {
      const res = await cmsService.getAdminEquipment();
      if (res.success && res.data) {
        setEquipmentList(res.data);
      }
    } catch (err) {
      toast.error('Failed to load equipment list.');
    } finally {
      setLoadingEquip(false);
    }
  };

  useEffect(() => {
    fetchEngineer();
    fetchEquipment();
  }, []);

  // --- 1-Click Upload for Lionel Profile Photo ---
  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (.jpg, .jpeg, .png, .webp, .gif)');
      return;
    }

    const uploadFormData = new FormData();
    uploadFormData.append('photo', file);
    uploadFormData.append('image', file);

    setIsUploading(true);
    try {
      const res = await cmsService.uploadTeamPhoto(uploadFormData);
      if (res.success && res.imageUrl) {
        setFormData((prev) => ({ ...prev, photo: res.imageUrl }));

        // Auto-save photo to database if engineer already exists
        if (engineer?._id) {
          await cmsService.updateTeamMember(engineer._id, {
            ...engineer,
            photo: res.imageUrl,
          });
          toast.success("Lionel's Sound Engineer photo updated & live on Homepage! 📸✨");
          fetchEngineer();
        } else {
          toast.success('Photo uploaded from device! Click "Save Profile Changes" to finish.');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload photo.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (engineer?._id) {
        const res = await cmsService.updateTeamMember(engineer._id, {
          ...formData,
          category: 'SOUND_ENGINEER',
        });
        if (res.success) {
          toast.success('Sound Engineer profile updated successfully! 🎧');
          fetchEngineer();
        }
      } else {
        const res = await cmsService.createTeamMember({
          ...formData,
          category: 'SOUND_ENGINEER',
        });
        if (res.success) {
          toast.success('Sound Engineer profile created successfully! 🎧');
          fetchEngineer();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save Sound Engineer profile.');
    } finally {
      setIsSaving(false);
    }
  };

  // --- Equipment Modal Handlers ---
  const openNewGearModal = () => {
    setIsNewGear(true);
    setGearFormData({
      title: '',
      tag: 'Mixer Console',
      desc: '',
      image: '/gallery/sound_engineer_console.png',
      order: equipmentList.length + 1,
      isActive: true,
    });
    setEditingGear({});
    setGearPhotoMode('upload');
  };

  const openEditGearModal = (gear) => {
    setIsNewGear(false);
    setEditingGear(gear);
    setGearFormData({
      title: gear.title || '',
      tag: gear.tag || 'Mixer Console',
      desc: gear.desc || '',
      image: gear.image || '',
      order: gear.order ?? 0,
      isActive: gear.isActive ?? true,
    });
    setGearPhotoMode('upload');
  };

  const closeGearModal = () => {
    setEditingGear(null);
    setIsNewGear(false);
  };

  // 1-Click Upload for Equipment Photo in Modal
  const handleGearPhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (.jpg, .jpeg, .png, .webp)');
      return;
    }

    const uploadData = new FormData();
    uploadData.append('image', file);
    uploadData.append('photo', file);

    setGearUploadLoading(true);
    try {
      const res = await cmsService.uploadEquipmentPhoto(uploadData);
      if (res.success && res.imageUrl) {
        setGearFormData((prev) => ({ ...prev, image: res.imageUrl }));
        toast.success('Equipment photo uploaded successfully! 📸');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload equipment photo.');
    } finally {
      setGearUploadLoading(false);
      if (gearFileInputRef.current) gearFileInputRef.current.value = '';
    }
  };

  // Direct Card Photo Quick Upload (without opening full edit modal)
  const handleCardQuickUpload = async (gearId, file) => {
    if (!file || !file.type.startsWith('image/')) {
      toast.error('Please select an image file (.jpg, .jpeg, .png, .webp)');
      return;
    }

    const uploadData = new FormData();
    uploadData.append('image', file);
    uploadData.append('photo', file);

    try {
      const uploadRes = await cmsService.uploadEquipmentPhoto(uploadData);
      if (uploadRes.success && uploadRes.imageUrl) {
        const updateRes = await cmsService.updateEquipment(gearId, {
          image: uploadRes.imageUrl,
        });
        if (updateRes.success) {
          toast.success('Equipment picture updated successfully! ✨');
          fetchEquipment();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update equipment photo.');
    }
  };

  const handleSaveGear = async (e) => {
    if (e) e.preventDefault();
    if (!gearFormData.title.trim()) {
      toast.error('Please enter an equipment title.');
      return;
    }
    if (!gearFormData.image.trim()) {
      toast.error('Please provide or upload an equipment image.');
      return;
    }

    setIsSavingGear(true);
    try {
      if (isNewGear) {
        const res = await cmsService.createEquipment(gearFormData);
        if (res.success) {
          toast.success('New equipment added to studio calibration! 🎛️');
          closeGearModal();
          fetchEquipment();
        }
      } else {
        const res = await cmsService.updateEquipment(editingGear._id, gearFormData);
        if (res.success) {
          toast.success('Equipment details updated successfully! 🎛️');
          closeGearModal();
          fetchEquipment();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save equipment.');
    } finally {
      setIsSavingGear(false);
    }
  };

  const handleDeleteGear = async (gear) => {
    if (!window.confirm(`Are you sure you want to delete "${gear.title}"?`)) {
      return;
    }

    try {
      const res = await cmsService.deleteEquipment(gear._id);
      if (res.success) {
        toast.success('Equipment removed from showcase.');
        fetchEquipment();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete equipment.');
    }
  };

  const TAG_PRESETS = [
    'Mixer Console',
    'Jam Room',
    'Vocal Booth',
    'DAW Station',
    'Instrument Mics',
    'Audio Monitors',
    'Guitar Amps',
    'Drum Kit',
    'Acoustic Panels',
    'Cables & Routing',
  ];

  return (
    <div className="space-y-8 pb-12 max-w-6xl">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Headphones className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black font-display text-white">
              Sound Engineer & Equipment CMS
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage Lionel's official sound engineer profile, live photo, and all Equipment & Calibration gallery cards.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              fetchEngineer();
              fetchEquipment();
            }}
            disabled={loading || loadingEquip}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading || loadingEquip ? 'animate-spin' : ''}`} />
          </button>

          <Link
            to="/sound-engineer"
            target="_blank"
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 hover:text-white text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
            <span>Preview Public Page</span>
          </Link>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 p-1.5 bg-white/5 border border-white/10 rounded-2xl max-w-md">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-amber-500 text-dark-950 shadow-glow-yellow'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Sound Engineer Profile</span>
        </button>
        <button
          onClick={() => setActiveTab('equipment')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'equipment'
              ? 'bg-amber-500 text-dark-950 shadow-glow-yellow'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Equipment & Gear ({equipmentList.length})</span>
        </button>
      </div>

      {/* ==================== TAB 1: SOUND ENGINEER PROFILE ==================== */}
      {activeTab === 'profile' && (
        <>
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-400">Loading sound engineer details...</p>
            </div>
          ) : (
            <form onSubmit={handleSaveProfile} className="space-y-8">
              {/* Photo & Spotlight Showcase */}
              <div className="glass-panel-elevated rounded-3xl p-6 sm:p-8 border border-amber-500/30 bg-gradient-to-br from-dark-900/95 via-dark-950 to-dark-900 shadow-2xl relative overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  {/* Photo Card Preview */}
                  <div className="lg:col-span-4 flex flex-col items-center">
                    <div className="relative group shrink-0 w-48 sm:w-56 aspect-[3/4] rounded-2xl overflow-hidden border-2 border-amber-500/40 bg-dark-900 shadow-2xl">
                      <img
                        src={formData.photo || '/team/lionel.jpg'}
                        alt={formData.name || 'Lionel'}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.target.src = '/team/lionel.jpg';
                        }}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-dark-950/90 via-dark-950/20 to-transparent" />

                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-full bg-dark-950/85 backdrop-blur-md border border-amber-500/40 text-amber-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-md">
                          <Sliders className="w-3 h-3 text-amber-400" />
                          Live Photo
                        </span>
                      </div>

                      <div className="absolute bottom-3 left-3 right-3 text-center">
                        <span className="text-xs font-bold text-white block truncate">{formData.name}</span>
                        <span className="text-[10px] text-amber-400 block truncate">{formData.role}</span>
                      </div>
                    </div>

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePhotoSelect}
                      accept="image/*"
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="mt-4 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-dark-950 font-extrabold text-xs shadow-glow-yellow transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                    >
                      {isUploading ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-dark-950 border-t-transparent rounded-full animate-spin" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5 text-dark-950 stroke-[2.5]" />
                          <span>Upload Photo from Device</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Photo Input Controls & Live Info */}
                  <div className="lg:col-span-8 space-y-5">
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Homepage Spotlight & Sound Engineer Page Sync</span>
                      </div>
                      <h3 className="text-xl font-bold font-display text-white">
                        Sound Engineer Profile Picture
                      </h3>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Upload a high-resolution portrait of Lionel from your computer. Any update here automatically reflects on the homepage spotlight and the public Sound Engineer profile.
                      </p>
                    </div>

                    {/* Photo Mode Switcher */}
                    <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/10">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200">Image Source</span>
                        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-dark-900 border border-white/10 text-xs">
                          <button
                            type="button"
                            onClick={() => setPhotoMode('upload')}
                            className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                              photoMode === 'upload'
                                ? 'bg-amber-500 text-dark-950 shadow-glow-yellow'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            Upload from Device
                          </button>
                          <button
                            type="button"
                            onClick={() => setPhotoMode('url')}
                            className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                              photoMode === 'url'
                                ? 'bg-amber-500 text-dark-950 shadow-glow-yellow'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            Image URL
                          </button>
                        </div>
                      </div>

                      {photoMode === 'upload' ? (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-white/15 hover:border-amber-400/60 rounded-xl p-5 text-center cursor-pointer transition-all bg-dark-950/40 hover:bg-amber-500/5 space-y-1.5"
                        >
                          <Upload className="w-5 h-5 text-amber-400 mx-auto" />
                          <span className="text-xs font-bold text-white block">
                            Click to select photo from your PC / phone
                          </span>
                          <span className="text-[11px] text-slate-400 block">
                            Supports JPG, PNG, WEBP, Google Photos (up to 25MB)
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-semibold text-slate-300">Direct Image URL</label>
                          <input
                            type="url"
                            value={formData.photo}
                            onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                            placeholder="https://..."
                            className="w-full px-3.5 py-2.5 rounded-xl bg-dark-900 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sound Engineer Information Form */}
              <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-5">
                <h3 className="text-base font-bold font-display text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  <span>Sound Engineer Details & Bio</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-200">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Lionel"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* Role / Title */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-200">Role / Studio Title *</label>
                    <input
                      type="text"
                      required
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      placeholder="e.g. Chief Sound Engineer & Studio Custodian"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Acoustic Specialties & Gear Focus */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200">
                    Acoustic Specialties & Studio Focus
                  </label>
                  <input
                    type="text"
                    value={formData.instrument}
                    onChange={(e) => setFormData({ ...formData, instrument: e.target.value })}
                    placeholder="e.g. Live Sound Mixing, Multitrack DAW & Studio Acoustics"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Sound Engineer Bio */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200">
                    Studio Bio & Responsibilities Description
                  </label>
                  <textarea
                    rows={4}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Describe Lionel's audio engineering responsibilities, console routing, DAW multitrack recording, and studio management..."
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400 leading-relaxed"
                  />
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-3 border-t border-white/5">
                  <button
                    type="submit"
                    disabled={isSaving || isUploading}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-dark-950 font-extrabold text-xs shadow-glow-yellow transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 text-dark-950 stroke-[2.5]" />
                    <span>{isSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </>
      )}

      {/* ==================== TAB 2: EQUIPMENT & CALIBRATION GALLERY ==================== */}
      {activeTab === 'equipment' && (
        <div className="space-y-6">
          {/* Equipment Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white/5 border border-white/10">
            <div>
              <h2 className="text-base font-bold font-display text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>Equipment & Calibration Gallery Cards</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Edit pictures, titles, tags, and sound engineering descriptions for every card shown on the Sound Engineer page.
              </p>
            </div>

            <button
              onClick={openNewGearModal}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-dark-950 font-extrabold text-xs shadow-glow-yellow transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 text-dark-950 stroke-[3]" />
              <span>Add Equipment Card</span>
            </button>
          </div>

          {loadingEquip ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-400">Loading equipment cards...</p>
            </div>
          ) : equipmentList.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white/5 border border-dashed border-white/10 space-y-3">
              <Layers className="w-10 h-10 text-slate-500 mx-auto" />
              <p className="text-sm font-semibold text-white">No Equipment Cards Found</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Add your first piece of studio gear (mixing console, vocal mics, DAW station, etc.) to showcase it on the public page.
              </p>
              <button
                onClick={openNewGearModal}
                className="mt-2 px-4 py-2 rounded-xl bg-amber-500 text-dark-950 font-bold text-xs"
              >
                Create Equipment Card
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
              {equipmentList.map((gear) => (
                <div
                  key={gear._id}
                  className={`glass-panel rounded-3xl overflow-hidden border transition-all flex flex-col h-full group relative ${
                    gear.isActive ? 'border-white/10 hover:border-amber-500/40' : 'border-red-500/20 opacity-75'
                  }`}
                >
                  {/* Card Image Area with Fixed Aspect Ratio & Quick Upload Action */}
                  <div className="relative aspect-[16/10] w-full bg-dark-950 overflow-hidden shrink-0">
                    <img
                      src={gear.image}
                      alt={gear.title}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.target.src = '/gallery/sound_engineer_console.png';
                      }}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/20 to-transparent" />

                    {/* Tag Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full bg-dark-950/85 backdrop-blur-md border border-white/15 text-amber-300 text-[10px] font-bold uppercase tracking-wider shadow-sm">
                        {gear.tag}
                      </span>
                    </div>

                    {/* Active / Inactive Badge */}
                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${
                          gear.isActive
                            ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                            : 'bg-red-500/20 border border-red-500/30 text-red-400'
                        }`}
                      >
                        {gear.isActive ? 'Active' : 'Hidden'}
                      </span>
                    </div>

                    {/* 1-Click Hover "Change Photo" Button */}
                    <div className="absolute inset-0 bg-dark-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                      <label className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-dark-950 text-xs font-bold shadow-lg flex items-center gap-1.5 cursor-pointer transform hover:scale-105 transition-all">
                        <Camera className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Change Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleCardQuickUpload(gear._id, file);
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Card Body with Consistent Vertical Alignment */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <h3 className="font-display font-bold text-sm text-white line-clamp-2 min-h-[2.5rem] flex items-start">
                        {gear.title}
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 min-h-[3rem]">
                        {gear.desc}
                      </p>
                    </div>

                    {/* Card Actions Aligned at Bottom */}
                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                      <button
                        onClick={() => openEditGearModal(gear)}
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white hover:text-amber-400 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Card</span>
                      </button>

                      <button
                        onClick={() => handleDeleteGear(gear)}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                        title="Delete Equipment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================== MODAL: ADD / EDIT EQUIPMENT CARD ==================== */}
      <Modal
        isOpen={Boolean(editingGear)}
        onClose={closeGearModal}
        title={isNewGear ? 'Add New Studio Equipment' : 'Edit Equipment Card'}
        subtitle="Customize the image, title, badge tag, and engineering description."
        maxWidth="max-w-xl"
        footer={
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={closeGearModal}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveGear}
              disabled={isSavingGear || gearUploadLoading}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-dark-950 font-extrabold text-xs shadow-glow-yellow transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-dark-950 stroke-[2.5]" />
              <span>{isSavingGear ? 'Saving...' : isNewGear ? 'Add Equipment' : 'Save Changes'}</span>
            </button>
          </div>
        }
      >
        <form onSubmit={handleSaveGear} className="space-y-4">
          {/* Picture Preview & Upload Section */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200">Equipment Picture *</label>
              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-dark-950 border border-white/10 text-xs">
                <button
                  type="button"
                  onClick={() => setGearPhotoMode('upload')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                    gearPhotoMode === 'upload'
                      ? 'bg-amber-500 text-dark-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Upload from Device
                </button>
                <button
                  type="button"
                  onClick={() => setGearPhotoMode('url')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                    gearPhotoMode === 'url'
                      ? 'bg-amber-500 text-dark-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Image URL
                </button>
              </div>
            </div>

            {/* Picture Preview Box */}
            {gearFormData.image && (
              <div className="relative aspect-video max-h-48 rounded-2xl overflow-hidden border border-white/15 bg-dark-950">
                <img
                  src={gearFormData.image}
                  alt="Gear Preview"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute top-2.5 left-2.5">
                  <span className="px-2 py-0.5 rounded-md bg-dark-950/80 text-amber-300 text-[10px] font-bold shadow-sm">
                    {gearFormData.tag || 'Preview'}
                  </span>
                </div>
              </div>
            )}

            {/* Photo Upload Mode */}
            {gearPhotoMode === 'upload' ? (
              <div>
                <input
                  type="file"
                  ref={gearFileInputRef}
                  onChange={handleGearPhotoSelect}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => gearFileInputRef.current?.click()}
                  disabled={gearUploadLoading}
                  className="w-full py-3.5 px-4 border-2 border-dashed border-white/20 hover:border-amber-400/60 rounded-2xl bg-white/5 hover:bg-amber-500/5 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5"
                >
                  {gearUploadLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-bold text-slate-300">Uploading photo...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-amber-400" />
                      <span className="text-xs font-bold text-white">
                        Click to upload gear picture from PC / Phone
                      </span>
                      <span className="text-[10px] text-slate-400">
                        JPG, PNG, WEBP (stored in /uploads/gallery/)
                      </span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <input
                  type="url"
                  value={gearFormData.image}
                  onChange={(e) => setGearFormData({ ...gearFormData, image: e.target.value })}
                  placeholder="https://... or /gallery/..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-dark-950 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
            )}
          </div>

          {/* Title & Badge Tag */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-200">Equipment Title *</label>
              <input
                type="text"
                required
                value={gearFormData.title}
                onChange={(e) => setGearFormData({ ...gearFormData, title: e.target.value })}
                placeholder="e.g. Digital Mixing Console & Desk"
                className="w-full px-3.5 py-2.5 rounded-xl bg-dark-950 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-200">Badge Tag *</label>
              <input
                type="text"
                required
                value={gearFormData.tag}
                onChange={(e) => setGearFormData({ ...gearFormData, tag: e.target.value })}
                placeholder="e.g. Mixer Console"
                className="w-full px-3.5 py-2.5 rounded-xl bg-dark-950 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Tag Quick Presets */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-400">Quick Tag Presets:</label>
            <div className="flex flex-wrap gap-1.5">
              {TAG_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setGearFormData((prev) => ({ ...prev, tag: preset }))}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    gearFormData.tag === preset
                      ? 'bg-amber-500 text-dark-950'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-200">Acoustic & Gear Description</label>
            <textarea
              rows={3}
              value={gearFormData.desc}
              onChange={(e) => setGearFormData({ ...gearFormData, desc: e.target.value })}
              placeholder="e.g. 16/32-channel digital console with motorized faders, aux monitor routing, and parametric EQ."
              className="w-full px-3.5 py-2.5 rounded-xl bg-dark-950 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400 leading-relaxed"
            />
          </div>

          {/* Order & Active Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-dark-950 border border-white/10">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-300">Display Order</label>
              <input
                type="number"
                value={gearFormData.order}
                onChange={(e) =>
                  setGearFormData({ ...gearFormData, order: parseInt(e.target.value) || 0 })
                }
                className="w-16 px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white text-xs text-center focus:outline-none focus:border-amber-400"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={gearFormData.isActive}
                onChange={(e) =>
                  setGearFormData({ ...gearFormData, isActive: e.target.checked })
                }
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-dark-900 border-white/20"
              />
              <span className="text-xs font-bold text-white">Visible on Public Page</span>
            </label>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminTeamPage;
