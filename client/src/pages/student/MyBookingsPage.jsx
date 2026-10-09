import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookingCard } from '../../components/booking/BookingCard';
import { BookingPassCard } from '../../components/booking/BookingPassCard';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { EmptyState } from '../../components/common/EmptyState';
import { CardSkeleton } from '../../components/common/Skeleton';
import { bookingService } from '../../services/bookingService';
import { useToast } from '../../context/ToastContext';
import { Calendar, Radio, Clock, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

export const MyBookingsPage = () => {
  const toast = useToast();
  const [bookingsData, setBookingsData] = useState({ upcoming: [], past: [], cancelled: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  const [selectedPass, setSelectedPass] = useState(null);
  const [passModalOpen, setPassModalOpen] = useState(false);

  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await bookingService.getMyBookings();
      if (res.success) {
        setBookingsData(res.data);
      }
    } catch (err) {
      toast.error('Failed to load your bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleViewPass = (booking) => {
    setSelectedPass(booking);
    setPassModalOpen(true);
  };

  const handleInitiateCancel = (booking) => {
    setCancellingBooking(booking);
    setConfirmCancelOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!cancellingBooking) return;
    setCancelLoading(true);
    try {
      const res = await bookingService.cancelBooking(cancellingBooking._id, 'Student cancellation');
      if (res.success) {
        toast.success('Your Jam Room session has been cancelled.');
        setConfirmCancelOpen(false);
        setPassModalOpen(false);
        fetchBookings();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel booking.');
    } finally {
      setCancelLoading(false);
    }
  };

  const currentList =
    activeTab === 'upcoming'
      ? bookingsData.upcoming
      : activeTab === 'past'
      ? bookingsData.past
      : bookingsData.cancelled;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 pb-28">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
            Student Musician Portal
          </span>
          <h1 className="text-3xl font-display font-extrabold text-white mt-1">
            My Jam Room Bookings
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your Jam Room rehearsal passes, check status, or release slots.
          </p>
        </div>

        <Link
          to="/jam-room"
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-dark-950 font-extrabold text-xs shadow-glow-yellow transition-all self-start sm:self-auto flex items-center gap-1.5"
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Book New Slot</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 glass-panel rounded-2xl w-full sm:w-max">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`flex-1 sm:flex-initial px-5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'upcoming'
              ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-dark-950 shadow-glow-yellow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Upcoming ({bookingsData.upcoming?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`flex-1 sm:flex-initial px-5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'past'
              ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-dark-950 shadow-glow-yellow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Past Sessions ({bookingsData.past?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('cancelled')}
          className={`flex-1 sm:flex-initial px-5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'cancelled'
              ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-dark-950 shadow-glow-yellow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Cancelled ({bookingsData.cancelled?.length || 0})
        </button>
      </div>

      {/* List / Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : currentList && currentList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentList.map((b) => (
            <BookingCard
              key={b._id}
              booking={b}
              onViewPass={handleViewPass}
              onCancelBooking={b.status === 'CONFIRMED' ? handleInitiateCancel : null}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Calendar}
          title={
            activeTab === 'upcoming'
              ? 'No Upcoming Sessions'
              : activeTab === 'past'
              ? 'No Past Sessions'
              : 'No Cancelled Bookings'
          }
          description={
            activeTab === 'upcoming'
              ? 'You do not have any active Jam Room reservations. Book a 1-hour slot to get started!'
              : 'Your booking history will appear here after completing studio sessions.'
          }
          actionLabel={activeTab === 'upcoming' ? 'Book Jam Room Slot' : null}
          onAction={() => (window.location.href = '/jam-room')}
        />
      )}

      {/* View Pass Modal */}
      <Modal
        isOpen={passModalOpen}
        onClose={() => setPassModalOpen(false)}
        title="Digital Studio Pass"
        maxWidth="max-w-2xl"
      >
        <BookingPassCard
          booking={selectedPass}
          onCancel={
            selectedPass?.status === 'CONFIRMED'
              ? () => {
                  setPassModalOpen(false);
                  handleInitiateCancel(selectedPass);
                }
              : null
          }
        />
      </Modal>

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmCancelOpen}
        onClose={() => setConfirmCancelOpen(false)}
        onConfirm={handleConfirmCancel}
        title="Cancel Jam Room Booking?"
        message={`Are you sure you want to cancel your session on ${cancellingBooking?.date} (${cancellingBooking?.startTime} - ${cancellingBooking?.endTime})? This will immediately release the slot for other students.`}
        confirmText="Yes, Cancel Booking"
        isDestructive={true}
        isLoading={cancelLoading}
      />
    </div>
  );
};
