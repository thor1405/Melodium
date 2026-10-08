import React from 'react';
import { formatDate, formatSlotRange } from '../../utils/dateUtils';
import { Eye, CheckCircle2, XCircle, Clock, Trash2, Search, Filter, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';

export const BookingsTable = ({
  bookings = [],
  pagination,
  onPageChange,
  onViewDetails,
  onUpdateStatus,
  onCancel,
  sortBy = 'date',
  sortOrder = 'desc',
  onSortChange,
}) => {
  if (bookings.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-12 text-center text-slate-400 text-sm">
        No bookings found matching the current search and filter criteria.
      </div>
    );
  }

  const handleHeaderClick = (columnKey) => {
    if (!onSortChange) return;
    if (sortBy === columnKey) {
      onSortChange(columnKey, sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      onSortChange(columnKey, columnKey === 'bookingId' ? 'asc' : 'desc');
    }
  };

  const renderSortIndicator = (columnKey) => {
    if (sortBy !== columnKey) {
      return <ArrowUpDown className="w-3 h-3 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity ml-1" />;
    }
    return sortOrder === 'desc' ? (
      <ArrowDown className="w-3 h-3 text-brand-gold ml-1 animate-in fade-in" />
    ) : (
      <ArrowUp className="w-3 h-3 text-brand-gold ml-1 animate-in fade-in" />
    );
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto glass-panel rounded-2xl border border-white/5">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-white/10 bg-white/5 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <th 
                onClick={() => handleHeaderClick('bookingId')}
                className="py-4 px-4 cursor-pointer select-none group hover:text-white transition-colors"
                title="Sort by Booking ID"
              >
                <div className="flex items-center">
                  <span>Booking ID</span>
                  {renderSortIndicator('bookingId')}
                </div>
              </th>
              <th className="py-4 px-4">Student / Booker</th>
              <th 
                onClick={() => handleHeaderClick('date')}
                className="py-4 px-4 cursor-pointer select-none group hover:text-white transition-colors"
                title="Sort by Date (Latest / Earliest)"
              >
                <div className="flex items-center">
                  <span className={sortBy === 'date' ? 'text-brand-gold font-bold' : ''}>Date & Slot</span>
                  {renderSortIndicator('date')}
                </div>
              </th>
              <th className="py-4 px-4">Contact & USN</th>
              <th 
                onClick={() => handleHeaderClick('status')}
                className="py-4 px-4 cursor-pointer select-none group hover:text-white transition-colors"
                title="Sort by Status"
              >
                <div className="flex items-center">
                  <span className={sortBy === 'status' ? 'text-brand-gold font-bold' : ''}>Status</span>
                  {renderSortIndicator('status')}
                </div>
              </th>
              <th className="py-4 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {bookings.map((b) => {
              const isConfirmed = b.status === 'CONFIRMED';
              const isPending = b.status === 'PENDING';
              const isCompleted = b.status === 'COMPLETED';
              const isCancelled = b.status === 'CANCELLED' || b.status === 'REJECTED';

              return (
                <tr key={b._id} className="hover:bg-white/5 transition-colors">
                  {/* ID */}
                  <td className="py-3.5 px-4 font-mono font-bold text-brand-gold">
                    {b.bookingId}
                  </td>

                  {/* Student / Musician */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-white">
                        {b.bookerName || b.userId?.name || 'Musician'}
                      </span>
                      {b.userType === 'OUTSIDER' || b.feeAmount > 0 ? (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-bold">
                          Outsider (₹500)
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold">
                          SJEC (Free)
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate max-w-xs">
                      {b.userId?.email || 'N/A'}
                    </div>
                  </td>

                  {/* Date & Slot */}
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-200">{formatDate(b.date)}</div>
                    <div className="text-[11px] text-brand-purple font-mono">
                      {formatSlotRange(b.startTime, b.endTime)}
                    </div>
                  </td>

                  {/* Contact & USN */}
                  <td className="py-3.5 px-4">
                    <div className="font-mono text-white text-[11px]">
                      {b.userId?.usn || (b.userId?.organization ? b.userId.organization : 'Student')}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {b.userId?.phone || 'No phone registered'}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    {isConfirmed && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase">
                        Confirmed
                      </span>
                    )}
                    {isPending && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase">
                        Pending
                      </span>
                    )}
                    {isCompleted && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-bold uppercase">
                        Completed
                      </span>
                    )}
                    {isCancelled && (
                      <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold uppercase">
                        {b.status}
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onViewDetails(b)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {isPending && (
                        <>
                          <button
                            onClick={() => onUpdateStatus(b._id, 'CONFIRMED')}
                            className="p-1.5 rounded-lg bg-emerald-950/50 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-400"
                            title="Approve"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onUpdateStatus(b._id, 'REJECTED')}
                            className="p-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900 border border-rose-500/30 text-rose-400"
                            title="Reject"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}

                      {isConfirmed && onCancel && (
                        <button
                          onClick={() => onCancel(b)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 transition-colors"
                          title="Cancel Booking"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 px-2">
          <div>
            Showing page {pagination.page} of {pagination.pages} ({pagination.total} total bookings)
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => onPageChange(pagination.page - 1)}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white disabled:opacity-40 transition-colors"
            >
              Previous
            </button>
            <button
              disabled={pagination.page >= pagination.pages}
              onClick={() => onPageChange(pagination.page + 1)}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white disabled:opacity-40 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
