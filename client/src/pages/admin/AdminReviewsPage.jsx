import React, { useState, useEffect } from 'react';
import { reviewService } from '../../services/reviewService';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/dateUtils';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import {
  Star,
  Award,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Radio,
  ThumbsUp,
  MessageSquare,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

export const AdminReviewsPage = () => {
  const toast = useToast();
  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const [deletingReview, setDeletingReview] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const fetchReviews = async (page = 1) => {
    setLoading(true);
    try {
      const res = await reviewService.getAdminReviews({
        page,
        limit: 20,
        search: search.trim() || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        category: categoryFilter !== 'ALL' ? categoryFilter : undefined,
      });

      if (res.success && res.data) {
        setReviews(res.data.reviews || []);
        setPagination(res.data.pagination || { total: 0, page: 1, pages: 1 });
      }
    } catch (err) {
      toast.error('Failed to load reviews.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(1);
  }, [statusFilter, categoryFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchReviews(1);
  };

  const handleToggleFeatured = async (review) => {
    try {
      const nextFeatured = !review.isFeatured;
      const res = await reviewService.updateReviewStatus(review._id, {
        isFeatured: nextFeatured,
      });
      if (res.success) {
        toast.success(
          nextFeatured
            ? 'Review featured on Spotlight!'
            : 'Review unfeatured.'
        );
        setReviews((prev) =>
          prev.map((r) => (r._id === review._id ? { ...r, isFeatured: nextFeatured } : r))
        );
      }
    } catch (err) {
      toast.error('Failed to update featured status.');
    }
  };

  const handleUpdateStatus = async (reviewId, newStatus) => {
    try {
      const res = await reviewService.updateReviewStatus(reviewId, {
        status: newStatus,
      });
      if (res.success) {
        toast.success(`Review marked as ${newStatus}.`);
        setReviews((prev) =>
          prev.map((r) => (r._id === reviewId ? { ...r, status: newStatus } : r))
        );
      }
    } catch (err) {
      toast.error('Failed to update review status.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingReview) return;
    try {
      const res = await reviewService.deleteReview(deletingReview._id);
      if (res.success) {
        toast.success('Review deleted successfully.');
        setDeleteConfirmOpen(false);
        setReviews((prev) => prev.filter((r) => r._id !== deletingReview._id));
      }
    } catch (err) {
      toast.error('Failed to delete review.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <h2 className="text-xl font-bold font-display text-white">
            Musician Reviews & Moderation
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage public testimonials, toggle spotlight features, and moderate feedback.
          </p>
        </div>

        <button
          onClick={() => fetchReviews(pagination.page)}
          className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs border border-white/10 transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 glass-panel rounded-2xl border border-white/10 flex flex-col md:flex-row items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by reviewer name, title, or keywords..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
          />
        </form>

        <div className="w-full md:w-auto flex flex-wrap gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-dark-900 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
          >
            <option value="ALL">All Statuses</option>
            <option value="APPROVED">Approved (Live)</option>
            <option value="PENDING">Pending</option>
            <option value="FLAGGED">Flagged</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-dark-900 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
          >
            <option value="ALL">All Categories</option>
            <option value="STUDIO_EXPERIENCE">Studio & Rehearsal</option>
            <option value="JAM_ROOM_EQUIPMENT">Gear & Instruments</option>
            <option value="EVENTS_CONCERTS">Live Events</option>
            <option value="GENERAL">General</option>
          </select>
        </div>
      </div>

      {/* Reviews Table */}
      {loading ? (
        <div className="py-24 text-center text-slate-400 text-xs">
          <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading reviews...
        </div>
      ) : reviews.length === 0 ? (
        <div className="py-16 text-center text-slate-400 text-xs">No reviews found.</div>
      ) : (
        <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-white/5 border-b border-white/10 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Reviewer</th>
                  <th className="py-3.5 px-4">Rating</th>
                  <th className="py-3.5 px-4">Headline & Feedback</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Spotlight</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {reviews.map((rev) => (
                  <tr key={rev._id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Reviewer */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white text-sm">{rev.userName}</div>
                      <div className="text-[11px] text-slate-400">{rev.userRole}</div>
                      {rev.userEmail && (
                        <div className="text-[10px] text-slate-500 font-mono">{rev.userEmail}</div>
                      )}
                    </td>

                    {/* Rating */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 font-bold text-amber-300">
                        <span>{rev.rating}</span>
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {formatDate(rev.createdAt, 'dd MMM yyyy')}
                      </span>
                    </td>

                    {/* Headline & Feedback */}
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="font-bold text-white truncate mb-0.5">"{rev.title}"</div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {rev.comment}
                      </p>
                      <div className="flex items-center gap-1 text-[10px] text-amber-400/80 mt-1">
                        <ThumbsUp className="w-3 h-3" />
                        <span>{rev.likesCount || 0} helpful votes</span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white/5 border border-white/5 text-slate-300">
                        {rev.category?.replace(/_/g, ' ')}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <select
                        value={rev.status}
                        onChange={(e) => handleUpdateStatus(rev._id, e.target.value)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg border focus:outline-none cursor-pointer ${
                          rev.status === 'APPROVED'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : rev.status === 'FLAGGED'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        <option value="APPROVED">Approved (Live)</option>
                        <option value="PENDING">Pending</option>
                        <option value="FLAGGED">Flagged</option>
                      </select>
                    </td>

                    {/* Spotlight Toggle */}
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(rev)}
                        className={`p-1.5 rounded-lg border text-xs transition-all cursor-pointer ${
                          rev.isFeatured
                            ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-glow-yellow'
                            : 'bg-white/5 border-white/10 text-slate-500 hover:text-slate-300'
                        }`}
                        title={rev.isFeatured ? 'Featured on Spotlight (Click to remove)' : 'Click to feature on Spotlight'}
                      >
                        <Award className="w-4 h-4" />
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setDeletingReview(rev);
                          setDeleteConfirmOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-rose-950/30 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 hover:text-white transition-colors cursor-pointer"
                        title="Delete Review"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Musician Review?"
        message={`Are you sure you want to permanently delete the review by "${deletingReview?.userName}"? This action cannot be undone.`}
        confirmText="Yes, Delete Review"
        isDestructive={true}
      />
    </div>
  );
};
