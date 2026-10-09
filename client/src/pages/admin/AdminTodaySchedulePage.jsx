import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { bookingService } from '../../services/bookingService';
import { TodayTimeline } from '../../components/admin/TodayTimeline';
import { BlockSlotModal } from '../../components/admin/BlockSlotModal';
import { ManualBookingModal } from '../../components/admin/ManualBookingModal';
import { Modal } from '../../components/common/Modal';
import { BookingPassCard } from '../../components/booking/BookingPassCard';
import { useToast } from '../../context/ToastContext';
import { formatDate, getTodayString } from '../../utils/dateUtils';
import { Calendar, Clock, Radio, Plus, Ban, ArrowLeft, ArrowRight } from 'lucide-react';

export const AdminTodaySchedulePage = () => {
  const toast = useToast();
  const [date, setDate] = useState(() => getTodayString());
  const [scheduleData, setScheduleData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedSlotForBlock, setSelectedSlotForBlock] = useState(null);
  const [blockModalOpen, setBlockModalOpen] = useState(false);

  const [selectedSlotForManual, setSelectedSlotForManual] = useState(null);
  const [manualModalOpen, setManualModalOpen] = useState(false);

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const fetchSchedule = async (targetDate) => {
    setLoading(true);
    try {
      const res = await adminService.getTodaySchedule(targetDate);
      if (res.success) {
        setScheduleData(res.data);
      }
    } catch (err) {
      toast.error('Failed to load schedule.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule(date);
  }, [date]);

  const handleApprove = async (bookingId) => {
    try {
      const res = await adminService.updateBookingStatus(bookingId, { status: 'CONFIRMED' });
      if (res.success) {
        toast.success('Booking approved!');
        fetchSchedule(date);
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
        fetchSchedule(date);
      }
    } catch (err) {
      toast.error('Could not cancel booking.');
    }
  };

  const handleViewDetails = async (bookingId) => {
    try {
      const res = await bookingService.getBookingDetails(bookingId);
      if (res && res.success && res.booking) {
        setSelectedBooking(res.booking);
        setDetailsModalOpen(true);
        return;
      }
    } catch (e) {}

    const b =
      scheduleData?.bookings?.find((x) => x._id === bookingId || x.bookingId === bookingId) ||
      scheduleData?.schedule?.find((s) => s.bookingDbId === bookingId || s.bookingId === bookingId);
    if (b) {
      const normalized = {
        ...b,
        date: b.date || date,
        userId: b.userId || (b.student ? {
          name: b.student.name,
          email: b.student.email,
          usn: b.student.usn,
          phone: b.student.phone,
          department: b.student.department,
        } : null),
      };
      setSelectedBooking(normalized);
      setDetailsModalOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Date Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <h2 className="text-xl font-bold font-display text-white">
            Daily Jam Room Timeline
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Full slot-by-slot live status & reservations for {formatDate(date, 'EEEE, dd MMMM yyyy')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Date Picker Input */}
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-purple"
          />

          <button
            onClick={() => {
              setSelectedSlotForBlock(null);
              setBlockModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-rose-950/40 border border-white/10 text-rose-300 text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <Ban className="w-3.5 h-3.5" />
            <span>Block Slot</span>
          </button>

          <button
            onClick={() => {
              setSelectedSlotForManual(null);
              setManualModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-dark-950 text-xs font-extrabold shadow-glow-yellow transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Manual Reservation</span>
          </button>
        </div>
      </div>

      {/* Schedule Container */}
      <div className="glass-panel-elevated rounded-3xl p-6 sm:p-8 border border-white/10">
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-xs">
            <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading timeline...
          </div>
        ) : (
          <TodayTimeline
            schedule={scheduleData?.schedule || []}
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
        )}
      </div>

      {/* Block Slot Modal */}
      <BlockSlotModal
        isOpen={blockModalOpen}
        onClose={() => setBlockModalOpen(false)}
        defaultDate={date}
        defaultSlot={selectedSlotForBlock}
        onSuccess={() => fetchSchedule(date)}
      />

      {/* Manual Booking Modal */}
      <ManualBookingModal
        isOpen={manualModalOpen}
        onClose={() => setManualModalOpen(false)}
        defaultDate={date}
        defaultSlot={selectedSlotForManual}
        onSuccess={() => fetchSchedule(date)}
      />

      {/* Booking Details Modal */}
      <Modal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title="Student Booking Pass & Record"
        maxWidth="max-w-2xl"
      >
        <BookingPassCard booking={selectedBooking} />
      </Modal>
    </div>
  );
};
