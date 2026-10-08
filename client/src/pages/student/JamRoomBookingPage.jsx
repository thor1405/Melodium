import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DateSelector } from '../../components/booking/DateSelector';
import { SlotGrid } from '../../components/booking/SlotGrid';
import { BookingModal } from '../../components/booking/BookingModal';
import { SlotSkeleton } from '../../components/common/Skeleton';
import { bookingService } from '../../services/bookingService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatDate, formatTime12h, getTodayString, getLocalDateString } from '../../utils/dateUtils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radio,
  Clock,
  Sparkles,
  ShieldAlert,
  Info,
  CheckCircle2,
  Calendar,
  Layers,
  MapPin,
  ArrowRight,
  X,
  Check,
} from 'lucide-react';

export const JamRoomBookingPage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [selectedDate, setSelectedDate] = useState(() => getTodayString());
  const [globalSettings, setGlobalSettings] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch live global booking parameters once on mount
  useEffect(() => {
    const loadGlobalSettings = async () => {
      try {
        const res = await bookingService.getBookingSettings();
        if (res.success && res.data) {
          setGlobalSettings(res.data);
          const activeDays = res.data.availableDays || [0, 1, 2, 3, 4, 5, 6];
          const todayObj = new Date();
          if (!activeDays.includes(todayObj.getDay())) {
            for (let i = 1; i <= 7; i++) {
              const next = new Date();
              next.setDate(todayObj.getDate() + i);
              if (activeDays.includes(next.getDay())) {
                setSelectedDate(getLocalDateString(next));
                break;
              }
            }
          } else {
            setSelectedDate(getTodayString());
          }
        }
      } catch (err) {}
    };
    loadGlobalSettings();
  }, []);

  const fetchSlots = async (dateStr) => {
    setLoading(true);
    try {
      const res = await bookingService.getAvailability(dateStr);
      if (res.success) {
        setAvailability(res.data);
      }
    } catch (err) {
      toast.error('Failed to fetch slot availability.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots(selectedDate);
    // Poll availability every 15s so user sees newly booked slots in real time
    const interval = setInterval(() => {
      fetchSlots(selectedDate);
    }, 15000);
    return () => clearInterval(interval);
  }, [selectedDate]);

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    setSelectedSlots([]);
  };

  const handleToggleSlot = (slot) => {
    if (!isAuthenticated) {
      toast.info('Please log in with your student account to select slots.');
      navigate('/login', { state: { from: { pathname: '/jam-room' } } });
      return;
    }

    setSelectedSlots((prev) => {
      const exists = prev.some((s) => s.startTime === slot.startTime);
      if (exists) {
        return prev.filter((s) => s.startTime !== slot.startTime);
      } else {
        const nextSlots = [...prev, slot];
        return nextSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));
      }
    });
  };

  const handleClearSlots = () => {
    setSelectedSlots([]);
  };

  const handleSelectAllFreeSlots = () => {
    if (!isAuthenticated) {
      toast.info('Please log in with your student account.');
      navigate('/login', { state: { from: { pathname: '/jam-room' } } });
      return;
    }
    const freeSlots = (availability?.slots || []).filter((s) => s.status === 'AVAILABLE');
    setSelectedSlots(freeSlots);
  };

  const handleOpenBookingModal = () => {
    if (selectedSlots.length === 0) {
      toast.error('Please select at least one available slot first.');
      return;
    }
    setIsModalOpen(true);
  };

  const handleBookingSuccess = () => {
    fetchSlots(selectedDate);
  };

  const handleCloseBookingModal = () => {
    setIsModalOpen(false);
    setSelectedSlots([]);
    fetchSlots(selectedDate);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 pb-36">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Studio 1 Jam Room</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white">
            Jam Room Multi-Slot Reservation
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
            Select an active date on the calendar, choose one or multiple available time slots for your band rehearsal, and proceed to reserve your studio pass.
          </p>
        </div>

        {/* Studio Location & Rules Badge */}
        <div className="p-4 rounded-2xl glass-panel border border-white/10 space-y-1.5 text-xs text-slate-300">
          <div className="flex items-center gap-2 font-bold text-white">
            <MapPin className="w-4 h-4 text-amber-400" />
            <span>Academic Block 3, Ground Floor</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Operating: 09:00 AM – 06:00 PM • 60 Mins/Slot
          </div>
        </div>
      </div>

      {/* Full Month Interactive Calendar Date Selector */}
      <DateSelector
        selectedDate={selectedDate}
        onSelectDate={handleDateChange}
        availableDays={
          availability?.settings?.availableDays ||
          globalSettings?.availableDays ||
          [0, 1, 2, 3, 4, 5, 6]
        }
      />

      {/* Booking Notice / Maintenance Alert (if any) */}
      {availability && !availability.isAvailable && (
        <div className="p-5 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-sm text-white mb-0.5">Booking Notice</div>
            <p className="leading-relaxed">{availability.reason}</p>
          </div>
        </div>
      )}

      {/* Slots Section */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <h2 className="text-base font-bold text-white font-display">
              Available Rehearsal Slots for {formatDate(selectedDate, 'MMMM d, yyyy')}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {availability && (
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
                <strong className="text-emerald-400">{availability.availableSlotsCount}</strong> of{' '}
                {availability.totalSlots} Slots Free
              </span>
            )}

            {availability?.availableSlotsCount > 1 && selectedSlots.length === 0 && (
              <button
                type="button"
                onClick={handleSelectAllFreeSlots}
                className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 transition-colors"
              >
                Select All Free Slots
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <SlotSkeleton />
        ) : (
          <SlotGrid
            slots={availability?.slots || []}
            selectedSlots={selectedSlots}
            onToggleSlot={handleToggleSlot}
          />
        )}
      </div>

      {/* Jam Room Guidelines Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="glass-panel rounded-2xl p-5 border border-white/5 space-y-2">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>SJEC Students: 100% Free</span>
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            All 1-hour rehearsal slots on your active date are completely free for verified SJEC student & faculty musicians.
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-white/5 space-y-2">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
            <span>Outsiders: Flat ₹500 / Day Pass</span>
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            External bands and guest musicians pay a single flat ₹500 fee covering all reserved slots for that entire day.
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-white/5 space-y-2">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-yellow-400" />
            <span>1 Active Date Policy</span>
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Musicians can reserve multiple slots on their chosen day, but cannot book other future dates until current sessions complete or are cancelled.
          </p>
        </div>
      </div>

      {/* Floating Sticky Bottom Multi-Slot Action Bar */}
      <AnimatePresence>
        {selectedSlots.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed bottom-8 sm:bottom-10 inset-x-0 z-40 max-w-3xl mx-auto px-4 pointer-events-none"
          >
            <div className="glass-panel p-3 sm:p-3.5 rounded-2xl border border-amber-400/50 bg-dark-950/95 shadow-2xl backdrop-blur-xl flex flex-wrap items-center justify-between gap-3 pointer-events-auto ring-1 ring-amber-400/40">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-400 text-dark-950 flex items-center justify-center font-bold text-sm shadow-glow-yellow shrink-0">
                  {selectedSlots.length}
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>{selectedSlots.length} {selectedSlots.length === 1 ? 'Slot' : 'Slots'} Selected</span>
                    <span className="text-amber-400">({selectedSlots.length} {selectedSlots.length === 1 ? 'Hour' : 'Hours'} Total)</span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 truncate max-w-xs sm:max-w-md">
                    <span>{formatDate(selectedDate, 'MMM d')}:</span>
                    <span className="text-slate-300 truncate">
                      {selectedSlots
                        .map((s) => `${formatTime12h(s.startTime)}`)
                        .join(', ')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={handleClearSlots}
                  className="px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenBookingModal}
                  className="px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-dark-950 font-extrabold text-xs shadow-glow-yellow transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 cursor-pointer"
                >
                  <span>Next: Proceed to Reserve</span>
                  <ArrowRight className="w-3.5 h-3.5 text-dark-950 stroke-[3]" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reservation & Pass Confirmation Modal */}
      <BookingModal
        isOpen={isModalOpen}
        onClose={handleCloseBookingModal}
        slots={selectedSlots}
        date={selectedDate}
        onSuccess={handleBookingSuccess}
      />
    </div>
  );
};
