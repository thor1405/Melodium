import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { BookingsTable } from '../../components/admin/BookingsTable';
import { Modal } from '../../components/common/Modal';
import { BookingPassCard } from '../../components/booking/BookingPassCard';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import { getTodayString } from '../../utils/dateUtils';
import { Search, Filter, Calendar, Plus, Ban, Download } from 'lucide-react';

export const AdminBookingsPage = () => {
  const toast = useToast();
  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);

  const fetchBookings = async (page = 1) => {
    setLoading(true);
    try {
      const res = await adminService.getAllBookings({
        page,
        limit: 15,
        search: search.trim() || undefined,
        status: status !== 'ALL' ? status : undefined,
        date: selectedDate || undefined,
        sortBy,
        sortOrder,
      });

      if (res.success) {
        setBookings(res.data.bookings);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      toast.error('Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(1);
  }, [status, selectedDate, sortBy, sortOrder]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBookings(1);
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await adminService.updateBookingStatus(id, { status: newStatus });
      if (res.success) {
        toast.success(`Booking ${newStatus.toLowerCase()} successfully.`);
        fetchBookings(pagination.page);
      }
    } catch (err) {
      toast.error('Failed to update booking status.');
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancellingBooking) return;
    try {
      const res = await adminService.updateBookingStatus(cancellingBooking._id, {
        status: 'CANCELLED',
        cancellationReason: 'Admin cancellation',
      });
      if (res.success) {
        toast.success('Booking cancelled and slot released.');
        setConfirmCancelOpen(false);
        fetchBookings(pagination.page);
      }
    } catch (err) {
      toast.error('Failed to cancel booking.');
    }
  };

  const exportCSV = () => {
    if (bookings.length === 0) {
      toast.info('No bookings available to export.');
      return;
    }
    const headers = ['Booking ID', 'Student Name', 'USN', 'Date', 'Start Time', 'End Time', 'Purpose', 'Status'];
    const rows = bookings.map((b) => [
      b.bookingId,
      b.userId?.name || 'Walk-in',
      b.userId?.usn || '',
      b.date,
      b.startTime,
      b.endTime,
      `"${b.purpose.replace(/"/g, '""')}"`,
      b.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `melodium_bookings_${getTodayString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <h2 className="text-xl font-bold font-display text-white">Student Bookings Manager</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Search, filter, approve, and track Jam Room reservations across all dates.
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs border border-white/10 transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 glass-panel rounded-2xl border border-white/10 flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name, USN, email, or Booking ID (e.g. MEL-202610)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-brand-purple"
          />
        </form>

        {/* Date Filter */}
        <div className="w-full md:w-auto">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full md:w-auto px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-purple"
          />
        </div>

        {/* Status Filter */}
        <div className="w-full md:w-auto">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full md:w-auto px-3.5 py-2.5 rounded-xl bg-dark-900 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-purple"
          >
            <option value="ALL">All Statuses</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PENDING">Pending Approval</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {/* Sort Order */}
        <div className="w-full md:w-auto">
          <select
            value={`${sortBy}:${sortOrder}`}
            onChange={(e) => {
              const [sBy, sOrder] = e.target.value.split(':');
              setSortBy(sBy);
              setSortOrder(sOrder);
            }}
            className="w-full md:w-auto px-3.5 py-2.5 rounded-xl bg-dark-900 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-purple"
          >
            <option value="date:desc">📅 Latest Date First (Top)</option>
            <option value="date:asc">🕒 Earliest Date First</option>
            <option value="createdAt:desc">🆕 Recently Booked (Newest)</option>
            <option value="createdAt:asc">⏳ Oldest Booked First</option>
          </select>
        </div>

        <button
          type="button"
          onClick={() => {
            setSearch('');
            setStatus('ALL');
            setSelectedDate('');
            setSortBy('date');
            setSortOrder('desc');
          }}
          className="px-3 py-2 text-xs text-slate-400 hover:text-white"
        >
          Reset
        </button>
      </div>

      {/* Bookings Table */}
      {loading ? (
        <div className="py-24 text-center text-slate-400 text-xs">
          <div className="w-6 h-6 border-2 border-brand-purple border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading reservations...
        </div>
      ) : (
        <BookingsTable
          bookings={bookings}
          pagination={pagination}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={(newSortBy, newSortOrder) => {
            setSortBy(newSortBy);
            setSortOrder(newSortOrder);
          }}
          onPageChange={(p) => fetchBookings(p)}
          onViewDetails={(b) => {
            setSelectedBooking(b);
            setDetailsModalOpen(true);
          }}
          onUpdateStatus={handleUpdateStatus}
          onCancel={(b) => {
            setCancellingBooking(b);
            setConfirmCancelOpen(true);
          }}
        />
      )}

      {/* Details Pass Modal */}
      <Modal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title="Jam Room Pass Details"
        maxWidth="max-w-2xl"
      >
        <BookingPassCard booking={selectedBooking} />
      </Modal>

      {/* Confirm Cancellation Dialog */}
      <ConfirmDialog
        isOpen={confirmCancelOpen}
        onClose={() => setConfirmCancelOpen(false)}
        onConfirm={handleConfirmCancel}
        title="Admin: Cancel Booking?"
        message={`Are you sure you want to cancel booking ${cancellingBooking?.bookingId}? The slot will immediately become available for student reservation.`}
        confirmText="Yes, Cancel Booking"
        isDestructive={true}
      />
    </div>
  );
};
