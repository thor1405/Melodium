import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { reviewService } from '../../services/reviewService';
import { formatDate } from '../../utils/dateUtils';
import { Modal } from '../../components/common/Modal';
import {
  Star,
  Sparkles,
  MessageSquare,
  ThumbsUp,
  Filter,
  Search,
  CheckCircle2,
  Radio,
  SlidersHorizontal,
  PenSquare,
  Music2,
  ShieldCheck,
  Heart,
  Volume2,
  Mic2,
  Layers,
  Award,
  TrendingUp,
  X,
} from 'lucide-react';

const CATEGORIES = [
  { id: 'ALL', label: 'All Reviews', icon: Layers },
  { id: 'STUDIO_EXPERIENCE', label: 'Studio & Rehearsal', icon: Radio },
  { id: 'JAM_ROOM_EQUIPMENT', label: 'Gear & Instruments', icon: Music2 },
  { id: 'EVENTS_CONCERTS', label: 'Live Events', icon: Volume2 },
  { id: 'GENERAL', label: 'General', icon: MessageSquare },
];

const RATING_DESCRIPTIONS = {
  1: 'Poor / Needs Improvement',
  2: 'Fair Experience',
  3: 'Good Session',
  4: 'Great Studio & Sound',
  5: 'Exceptional / World-Class! ⭐',
};

export const ReviewsPage = () => {
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();

  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 5.0,
    starCounts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    satisfactionRate: 100,
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedRating, setSelectedRating] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');

  // Write Review Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    comment: '',
    category: 'STUDIO_EXPERIENCE',
    userName: '',
    userEmail: '',
    userRole: '',
  });
  const [hoverRating, setHoverRating] = useState(0);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await reviewService.getPublicReviews({
        category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
        rating: selectedRating !== 'ALL' ? selectedRating : undefined,
        sortBy,
        search: searchQuery.trim() || undefined,
      });

      if (res.success && res.data) {
        setReviews(res.data.reviews || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      toast.error('Failed to load reviews.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [selectedCategory, selectedRating, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchReviews();
  };

  const handleOpenWriteModal = () => {
    if (isAuthenticated && user) {
      setFormData((prev) => ({
        ...prev,
        userName: prev.userName || user.name || '',
        userEmail: prev.userEmail || user.email || '',
        userRole: prev.userRole || user.department || 'Computer Science & Engineering',
      }));
    }
    setIsModalOpen(true);
  };

  const handleAutofillUser = () => {
    if (!user) return;
    setFormData((prev) => ({
      ...prev,
      userName: user.name || '',
      userEmail: user.email || '',
      userRole: user.department || 'Computer Science & Engineering',
    }));
    toast.info('Auto-filled with your department details.');
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Please enter a review headline.');
      return;
    }
    if (!formData.comment.trim()) {
      toast.error('Please write your review experience.');
      return;
    }
    if (!formData.userName.trim()) {
      toast.error('Please provide your name or artist handle.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await reviewService.createReview(formData);
      if (res.success) {
        toast.success('Your review was published live! Thank you for sharing your feedback.');
        setIsModalOpen(false);
        setFormData({
          rating: 5,
          title: '',
          comment: '',
          category: 'STUDIO_EXPERIENCE',
          userName: '',
          userEmail: '',
          userRole: '',
        });
        fetchReviews();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeReview = async (reviewId) => {
    try {
      const res = await reviewService.likeReview(reviewId);
      if (res.success) {
        setReviews((prev) =>
          prev.map((r) =>
            r._id === reviewId
              ? {
                  ...r,
                  likesCount: res.likesCount,
                  isLiked: res.hasLiked,
                }
              : r
          )
        );
      }
    } catch (err) {
      toast.error('Could not register like.');
    }
  };

  return (
    <div className="min-h-screen pb-32">
      {/* 1. HERO & STATS BANNER */}
      <section className="relative pt-8 sm:pt-14 pb-12 sm:pb-20 overflow-hidden border-b border-white/5">
        {/* Ambient Glows */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-transparent blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8 sm:space-y-12">
          {/* Top Title */}
          <div className="text-center space-y-3 sm:space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider shadow-glow-yellow">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Musician Experiences & Testimonials</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-extrabold text-white tracking-tight leading-tight">
              Hear What Artists & Bands Say About{' '}
              <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
                Melodium Studio
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Real reviews and acoustic feedback from verified SJEC student musicians, college band members, and guest artists who rehearse at Academic Block 3.
            </p>
          </div>

          {/* Rating Summary Card & Action Bar */}
          <div className="glass-panel-elevated rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
            {/* Left Big Score (4 cols) */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 rounded-2xl bg-white/[0.02] border border-white/5 text-center space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Overall Studio Rating
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl sm:text-6xl font-display font-black text-white">
                  {stats.averageRating ? stats.averageRating.toFixed(1) : '5.0'}
                </span>
                <span className="text-slate-500 text-base font-semibold">/ 5.0</span>
              </div>
              {/* Stars row */}
              <div className="flex items-center gap-1.5 py-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-5 h-5 ${
                      s <= Math.round(stats.averageRating || 5)
                        ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                        : 'text-slate-600'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Based on <strong>{stats.totalReviews}</strong> verified musician reviews
              </p>
            </div>

            {/* Middle Star Breakdown Progress (5 cols) */}
            <div className="lg:col-span-5 space-y-2">
              {[5, 4, 3, 2, 1].map((starNum) => {
                const count = stats.starCounts[starNum] || 0;
                const percent = stats.totalReviews > 0 ? Math.round((count / stats.totalReviews) * 100) : starNum === 5 ? 100 : 0;
                return (
                  <div key={starNum} className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1 w-12 shrink-0 font-bold text-slate-300">
                      <span>{starNum}</span>
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    </div>
                    <div className="flex-1 h-2 rounded-full bg-dark-900 overflow-hidden border border-white/5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-[11px] font-mono text-slate-400">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Right Write Review CTA (3 cols) */}
            <div className="lg:col-span-3 flex flex-col justify-center items-center lg:items-end gap-3 text-center lg:text-right border-t lg:border-t-0 lg:border-l border-white/5 pt-4 lg:pt-0 lg:pl-6">
              <div className="space-y-1">
                <div className="text-xs font-bold text-white flex items-center justify-center lg:justify-end gap-1.5 text-glow-yellow">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{stats.satisfactionRate}% Positive Feedback</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Have you jammed at Melodium? Share your experience with the community.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenWriteModal}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-dark-950 font-black text-xs sm:text-sm shadow-glow-yellow flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] cursor-pointer"
              >
                <PenSquare className="w-4 h-4" />
                <span>Write a Review</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORY TABS & FILTER BAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 shrink-0 transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-dark-950 border-amber-400 shadow-glow-yellow font-extrabold'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border-white/5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-dark-950' : 'text-amber-400'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Filter Controls Row */}
        <div className="glass-panel p-3.5 sm:p-4 rounded-2xl border border-white/10 flex flex-col md:flex-row items-center gap-3 justify-between">
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reviews, bands, instruments..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
            />
          </form>

          {/* Right Dropdowns */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
            {/* Rating Filter */}
            <select
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
              className="px-3 py-2 rounded-xl bg-dark-900 border border-white/10 text-xs text-slate-300 focus:outline-none focus:border-amber-400"
            >
              <option value="ALL">All Star Ratings</option>
              <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
              <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
              <option value="3">⭐⭐⭐ (3 Stars)</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-xl bg-dark-900 border border-white/10 text-xs text-slate-300 focus:outline-none focus:border-amber-400"
            >
              <option value="newest">Most Recent</option>
              <option value="highest">Highest Rating</option>
              <option value="helpful">Most Helpful</option>
              <option value="featured">Featured Spotlight</option>
            </select>
          </div>
        </div>

        {/* 3. REVIEWS GRID */}
        {loading ? (
          <div className="py-24 text-center text-slate-400 text-xs">
            <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading musician reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-12 rounded-3xl glass-panel text-center space-y-4 border border-white/5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="font-bold text-white text-base">No reviews matching your filters</h3>
              <p className="text-xs text-slate-400">
                Be the first to share your rehearsal or acoustic experience for this category.
              </p>
            </div>
            <button
              onClick={handleOpenWriteModal}
              className="px-5 py-2.5 rounded-xl bg-amber-400 text-dark-950 font-bold text-xs shadow-glow-yellow hover:bg-amber-300 transition-all cursor-pointer"
            >
              Write First Review
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {reviews.map((rev) => (
              <motion.div
                key={rev._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`rounded-3xl p-5 sm:p-6 flex flex-col justify-between space-y-4 transition-all border ${
                  rev.isFeatured
                    ? 'glass-panel-elevated border-amber-400/50 shadow-glow-yellow ring-1 ring-amber-400/40'
                    : 'glass-panel border-white/5 hover:border-amber-400/30'
                }`}
              >
                <div className="space-y-3.5">
                  {/* Card Header: Reviewer Info + Category */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-400 p-0.5 shadow-sm shrink-0">
                        <div className="w-full h-full rounded-[14px] bg-dark-950 flex items-center justify-center text-amber-400 font-extrabold text-sm uppercase">
                          {rev.userName ? rev.userName.charAt(0) : 'M'}
                        </div>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white text-sm truncate">
                            {rev.userName}
                          </span>
                          {rev.verifiedMusician && (
                            <span
                              title="Verified SJEC Musician / Jam Room Booking"
                              className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {rev.userRole || 'SJEC Student Musician'}
                        </div>
                      </div>
                    </div>

                    {rev.isFeatured && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[9px] font-black uppercase tracking-wider shrink-0 flex items-center gap-1">
                        <Award className="w-3 h-3" /> Featured
                      </span>
                    )}
                  </div>

                  {/* Star Rating & Date */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= rev.rating
                              ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.4)]'
                              : 'text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {formatDate(rev.createdAt, 'dd MMM yyyy')}
                    </span>
                  </div>

                  {/* Review Headline & Body */}
                  <div className="space-y-1.5">
                    <h4 className="font-display font-bold text-white text-sm sm:text-base leading-snug">
                      "{rev.title}"
                    </h4>
                    <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed">
                      {rev.comment}
                    </p>
                  </div>
                </div>

                {/* Footer: Category Tag & Helpful Like Button */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2 text-xs">
                  <span className="text-[10px] font-semibold text-slate-400 px-2 py-0.5 rounded-md bg-white/5">
                    {rev.category?.replace(/_/g, ' ')}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleLikeReview(rev._id)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/5 hover:bg-amber-500/10 border border-white/5 hover:border-amber-500/30 text-slate-400 hover:text-amber-300 text-xs font-semibold transition-all cursor-pointer group"
                    title="Mark review as helpful"
                  >
                    <ThumbsUp className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                    <span>Helpful</span>
                    {rev.likesCount > 0 && (
                      <span className="font-mono text-[11px] text-amber-300">
                        ({rev.likesCount})
                      </span>
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* 4. WRITE REVIEW MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Share Your Musician Experience"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
          {/* Star Rating Interactive Picker */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center space-y-2">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
              How was your experience?
            </label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((num) => {
                const isLit = (hoverRating || formData.rating) >= num;
                return (
                  <button
                    type="button"
                    key={num}
                    onMouseEnter={() => setHoverRating(num)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setFormData({ ...formData, rating: num })}
                    className="p-1.5 transition-transform hover:scale-125 cursor-pointer"
                  >
                    <Star
                      className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                        isLit
                          ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]'
                          : 'text-slate-600'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <div className="text-xs font-bold text-amber-300 font-display">
              {RATING_DESCRIPTIONS[hoverRating || formData.rating]}
            </div>
          </div>

          {/* Category Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Review Category</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.filter((c) => c.id !== 'ALL').map((c) => {
                const isSelected = formData.category === c.id;
                return (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => setFormData({ ...formData, category: c.id })}
                    className={`px-2.5 py-2 rounded-xl text-[11px] font-bold border transition-all text-center cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-glow-yellow'
                        : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Review Headline */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Review Headline *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Best Acoustics on Campus & Crystal Clear Sound"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Detailed Experience */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-300">Your Experience & Feedback *</label>
              <span className="text-[10px] text-slate-500">
                {formData.comment.length} / 1500
              </span>
            </div>
            <textarea
              required
              rows={4}
              maxLength={1500}
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              placeholder="Describe your session, drum/amp quality, isolation booth, sound engineer support, or booking convenience..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Reviewer Details */}
          <div className="pt-2 border-t border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                Musician Details
              </span>
              {isAuthenticated && user && (
                <button
                  type="button"
                  onClick={handleAutofillUser}
                  className="text-[11px] text-amber-400 hover:text-amber-300 underline font-semibold cursor-pointer"
                >
                  Auto-fill My SJEC Profile
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Your Name / Band *</label>
                <input
                  type="text"
                  required
                  value={formData.userName}
                  onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                  placeholder="e.g. Rohan Kamath / Horizon Band"
                  className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Role / Department</label>
                <input
                  type="text"
                  value={formData.userRole}
                  onChange={(e) => setFormData({ ...formData, userRole: e.target.value })}
                  placeholder="e.g. Lead Guitarist • SJEC ECE"
                  className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-dark-950 font-extrabold text-xs shadow-glow-yellow transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-dark-950 border-t-transparent rounded-full animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Publish Review</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
