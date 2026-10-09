import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { bookingService } from '../../services/bookingService';
import { TodayTimeline } from '../../components/admin/TodayTimeline';
import { BlockSlotModal } from '../../components/admin/BlockSlotModal';
import { ManualBookingModal } from '../../components/admin/ManualBookingModal';
import { Modal } from '../../components/common/Modal';
import { BookingPassCard } from '../../components/booking/BookingPassCard';
import { useToast } from '../../context/ToastContext';
import { formatDate, getRelativeTime } from '../../utils/dateUtils';
import {
  CalendarCheck,
  Clock,
  Users,
  Radio,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Plus,
  Ban,
  Activity,
} from 'lucide-react';

export const AdminOverviewPage = () => {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedSlotForBlock, setSelectedSlotForBlock] = useState(null);
  const [blockModalOpen, setBlockModalOpen] = useState(false);

  const [selectedSlotForManual, setSelectedSlotForManual] = useState(null);
  const [manualModalOpen, setManualModalOpen] = useState(false);

  const [selectedBookingDetails, setSelectedBookingDetails] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await adminService.getOverview();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      toast.error('Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleApprove = async (bookingId) => {
    try {
      const res = await adminService.updateBookingStatus(bookingId, { status: 'CONFIRMED' });
      if (res.success) {
        toast.success('Booking approved!');
        fetchOverview();
      }
    } catch (err) {
      toast.error('Could not approve booking.');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      const res = await adminService.updateBookingStatus(bookingId, {
        status: 'CANCELLED',
        cancellationReason: 'Cancelled by Administrator',
      });
      if (res.success) {
        toast.success('Booking cancelled and slot released.');
        fetchOverview();
      }
    } catch (err) {
      toast.error('Could not cancel booking.');
    }
  };

  const handleViewDetails = async (bookingId) => {
    try {
      const res = await bookingService.getBookingDetails(bookingId);
      if (res && res.success && res.booking) {
        setSelectedBookingDetails(res.booking);
        setDetailsModalOpen(true);
        return;
      }
    } catch (e) {}

    // Fallback lookup from overview state
    const b =
      data?.recentBookings?.find((x) => x._id === bookingId || x.bookingId === bookingId) ||
      data?.todaySchedule?.find((s) => s.bookingDbId === bookingId || s.bookingId === bookingId);

    if (b) {
      const normalized = {
        ...b,
        date: b.date || data?.todayDate,
        userId: b.userId || (b.student ? {
          name: b.student.name,
          email: b.student.email,
          usn: b.student.usn,
          phone: b.student.phone,
          department: b.student.department,
        } : null),
      };
      setSelectedBookingDetails(normalized);
      setDetailsModalOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400 text-sm">
        <div className="w-8 h-8 border-2 border-brand-purple border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        Loading Admin Dashboard...
      </div>
    );
  }

  const { metrics, todayDate, todaySchedule, recentBookings, recentLogs } = data || {};

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <div className="p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl glass-panel border border-white/5 space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs text-slate-400 font-semibold truncate">Today's Bookings</span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-display font-black text-white">
            {metrics?.todayBookingsCount || 0}
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-500 truncate">Reserved for {formatDate(todayDate)}</div>
        </div>

        <div className="p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl glass-panel border border-white/5 space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs text-slate-400 font-semibold truncate">Pending Approvals</span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
              <CalendarCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-display font-black text-white">
            {metrics?.pendingApprovalsCount || 0}
          </div>
          <div className="text-[10px] sm:text-[11px] text-amber-300/80 truncate">Requires review</div>
        </div>

        <div className="p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl glass-panel border border-white/5 space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs text-slate-400 font-semibold truncate">Total Students</span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-cyan-500/20 text-brand-cyan flex items-center justify-center shrink-0">
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-display font-black text-white">
            {metrics?.totalStudentsCount || 0}
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-500 truncate">Registered musicians</div>
        </div>

        <div className="p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl glass-panel border border-white/5 space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs text-slate-400 font-semibold truncate">All-Time Bookings</span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Radio className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-display font-black text-white">
            {metrics?.totalBookings || 0}
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-500 truncate">Sessions recorded</div>
        </div>
      </div>

      {/* 2. Today's Jam Room Schedule Timeline */}
      <div className="glass-panel-elevated rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-white/10 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <h2 className="text-base sm:text-lg font-bold font-display text-white">
                Today's Jam Room Live Timeline
              </h2>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
              Real-time slot schedule for {formatDate(todayDate, 'EEEE, dd MMMM yyyy')}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                setSelectedSlotForBlock(null);
                setBlockModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-rose-950/40 border border-white/10 text-rose-300 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Ban className="w-3.5 h-3.5" />
              <span>Block Slot</span>
            </button>
            <button
              onClick={() => {
                setSelectedSlotForManual(null);
                setManualModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-dark-950 text-xs font-extrabold shadow-glow-yellow transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Manual Book</span>
            </button>
          </div>
        </div>

        <TodayTimeline
          schedule={todaySchedule || []}
          onApproveBooking={handleApprove}
          onCancelBooking={handleCancelBooking}
          onBlockSlot={(slot) => {
            setSelectedSlotForBlock(slot);
            setBlockModalOpen(true);
          }}
          onSelectSlot={(slot) => {
            setSelectedSlotForManual(slot);
            setManualModalOpen(true);
          }}
          onViewBookingDetails={handleViewDetails}
        />
      </div>

      {/* 3. Recent Bookings & System Logs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Recent Bookings */}
        <div className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-display text-white">Recent Student Bookings</h3>
            <Link
              to="/admin/bookings"
              className="text-xs text-amber-400 hover:underline font-semibold flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentBookings && recentBookings.length > 0 ? (
              recentBookings.map((b) => (
                <div
                  key={b._id}
                  className="p-3 sm:p-3.5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-white flex items-center gap-2 flex-wrap">
                      <span>{b.userId?.name || 'Walk-in Student'}</span>
                      <span className="font-mono text-[10px] text-amber-400">({b.bookingId})</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {formatDate(b.date)} • {b.startTime} - {b.endTime}
                    </div>
                    {b.purpose && (
                      <div className="text-[11px] text-slate-300 italic truncate mt-0.5">
                        "{b.purpose}"
                      </div>
                    )}
                  </div>

                  <div className="self-start sm:self-center shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                        b.status === 'CONFIRMED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : b.status === 'PENDING'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-slate-500">No bookings yet.</div>
            )}
          </div>
        </div>

        {/* Activity Logs */}
        <div className="glass-panel rounded-3xl p-6 border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-display text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand-cyan" />
              <span>System & Action Logs</span>
            </h3>
            <Link
              to="/admin/logs"
              className="text-xs text-slate-400 hover:text-white font-semibold"
            >
              Full Log
            </Link>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {recentLogs && recentLogs.length > 0 ? (
              recentLogs.map((log) => (
                <div
                  key={log._id}
                  className="p-3 rounded-xl bg-white/5 border border-white/5 text-[11px] space-y-1"
                >
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="font-semibold text-white">{log.action}</span>
                    <span>{getRelativeTime(log.createdAt)}</span>
                  </div>
                  <p className="text-slate-300 text-xs">{log.details}</p>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-slate-500">No logs recorded.</div>
            )}
          </div>
        </div>
      </div>

      {/* Block Slot Modal */}
      <BlockSlotModal
        isOpen={blockModalOpen}
        onClose={() => setBlockModalOpen(false)}
        defaultDate={todayDate}
        defaultSlot={selectedSlotForBlock}
        onSuccess={fetchOverview}
      />

      {/* Manual Booking Modal */}
      <ManualBookingModal
        isOpen={manualModalOpen}
        onClose={() => setManualModalOpen(false)}
        defaultDate={todayDate}
        defaultSlot={selectedSlotForManual}
        onSuccess={fetchOverview}
      />

      {/* Details Modal */}
      <Modal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title="Booking Information"
        maxWidth="max-w-2xl"
      >
        <BookingPassCard booking={selectedBookingDetails} />
      </Modal>
    </div>
  );
};
