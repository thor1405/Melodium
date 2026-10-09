import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  Zap,
} from 'lucide-react';

export const JamRoomBookingPage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const [selectedDate, setSelectedDate] = useState(() => getTodayString());
  const [globalSettings, setGlobalSettings] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const calendarRef = useRef(null);
  const slotsSectionRef = useRef(null);

  // Auto-scroll directly to the Calendar on page load / navigation
  useEffect(() => {
    const timer = setTimeout(() => {
      if (calendarRef.current) {
        calendarRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [location.pathname, location.hash]);

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
    // Automatically smooth-scroll to slot timings section
    setTimeout(() => {
      if (slotsSectionRef.current) {
        slotsSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 60);
  };

  const handleDirectBookSlot = (slot) => {
    if (!isAuthenticated) {
      toast.info('Please log in with your student account to reserve slots.');
      navigate('/login', { state: { from: { pathname: '/jam-room' } } });
      return;
    }

    setSelectedSlots((prev) => {
      const exists = prev.some((s) => s.startTime === slot.startTime);
      if (exists && prev.length > 0) {
        return prev;
      }
      return [slot];
    });
    setIsModalOpen(true);
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
    setIsModalOpen(true);
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
    fetchSlots(selectedDate);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-10 pb-40 sm:pb-44">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6 pb-4 sm:pb-6 border-b border-white/5">
        <div className="space-y-1.5 sm:space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] sm:text-xs font-bold uppercase tracking-wider">
            <Radio className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-pulse" />
            <span>Melodium Jam Room</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-display font-extrabold text-white leading-tight">
            Jam Room Multi-Slot Reservation
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
            Select an active date on the calendar below, tap available time slots for your band rehearsal, and proceed to reserve your pass.
          </p>
        </div>

        {/* Studio Location & Rules Badge */}
        <div className="p-3 sm:p-4 rounded-2xl glass-panel border border-white/10 space-y-1 text-xs text-slate-300 shrink-0">
          <div className="flex items-center gap-1.5 font-bold text-white text-xs sm:text-sm">
            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
            <span>Academic Block 3, Ground Flr</span>
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-400">
            09:00 AM – 06:00 PM • 60 Mins/Slot
          </div>
        </div>
      </div>

      {/* Full Month Interactive Calendar Date Selector (Direct Focus Target) */}
      <div
        ref={calendarRef}
        id="booking-calendar"
        className="scroll-mt-20 sm:scroll-mt-24"
      >
        <DateSelector
          selectedDate={selectedDate}
          onSelectDate={handleDateChange}
          availableDays={
            availability?.settings?.availableDays ||
            globalSettings?.availableDays ||
            [0, 1, 2, 3, 4, 5, 6]
          }
        />
      </div>

      {/* Booking Notice / Maintenance Alert (if any) */}
      {availability && !availability.isAvailable && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-2.5 sm:gap-3">
          <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-xs sm:text-sm text-white mb-0.5">Booking Notice</div>
            <p className="leading-relaxed">{availability.reason}</p>
          </div>
        </div>
      )}

      {/* Slots Section */}
      <div
        ref={slotsSectionRef}
        id="slot-timings-section"
        className="space-y-3 sm:space-y-4 scroll-mt-20 sm:scroll-mt-24"
      >
        <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
            <h2 className="text-sm sm:text-base font-bold text-white font-display">
              Available Slots for {formatDate(selectedDate, 'dd MMMM yyyy')}
            </h2>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {availability && (
              <span className="text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
                <strong className="text-emerald-400">{availability.availableSlotsCount}</strong> /{' '}
                {availability.totalSlots} Free
              </span>
            )}

            {availability?.availableSlotsCount > 1 && selectedSlots.length === 0 && (
              <button
                type="button"
                onClick={handleSelectAllFreeSlots}
                className="text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 transition-colors cursor-pointer"
              >
                Select All Free
              </button>
            )}
          </div>
        </div>

        {/* Floating Hovering Multi-Slot Action Bar directly in Slots View */}
        <AnimatePresence>
          {selectedSlots.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.97 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="sticky top-20 sm:top-24 z-40 my-2"
            >
              <div className="glass-panel p-2.5 sm:p-3.5 rounded-2xl border-2 border-amber-400/90 bg-dark-950/95 shadow-2xl backdrop-blur-2xl flex items-center justify-between gap-2 sm:gap-3 ring-2 ring-amber-400/50 shadow-glow-yellow/30">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-400 text-dark-950 flex items-center justify-center font-black text-xs sm:text-sm shadow-glow-yellow shrink-0">
                    {selectedSlots.length}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] sm:text-xs font-bold text-white flex items-center gap-1 truncate">
                      <span>
                        {selectedSlots.length} {selectedSlots.length === 1 ? 'Slot' : 'Slots'}
                      </span>
                      <span className="text-amber-400 hidden xs:inline">
                        ({selectedSlots.length} {selectedSlots.length === 1 ? 'Hr' : 'Hrs'})
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[130px] sm:max-w-xs md:max-w-md">
                      {formatDate(selectedDate, 'MMM d')}:{' '}
                      {selectedSlots.map((s) => formatTime12h(s.startTime)).join(', ')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleClearSlots}
                    className="px-2 sm:px-3 py-2 rounded-xl text-[11px] sm:text-xs font-medium text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span className="hidden xs:inline">Clear</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenBookingModal}
                    className="px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-dark-950 font-black text-xs shadow-glow-yellow transition-all hover:scale-[1.03] active:scale-[0.97] flex items-center gap-1.5 cursor-pointer whitespace-nowrap shimmer-btn animate-pulse"
                  >
                    <Zap className="w-3.5 h-3.5 fill-current text-dark-950" />
                    <span>Reserve Pass</span>
                    <ArrowRight className="w-3.5 h-3.5 text-dark-950 stroke-[3]" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <SlotSkeleton />
        ) : (
          <SlotGrid
            slots={availability?.slots || []}
            selectedSlots={selectedSlots}
            onToggleSlot={handleToggleSlot}
            onOpenBookingModal={handleOpenBookingModal}
          />
        )}
      </div>

      {/* Jam Room Guidelines Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6 pt-2 sm:pt-4">
        <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-white/5 space-y-1.5 sm:space-y-2">
          <h3 className="font-bold text-xs sm:text-sm text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>SJEC Students: 100% Free</span>
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed">
            All 1-hour rehearsal slots on your active date are completely free for verified SJEC student & faculty musicians.
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-white/5 space-y-1.5 sm:space-y-2">
          <h3 className="font-bold text-xs sm:text-sm text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Outsiders: Flat ₹500 / Day Pass</span>
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed">
            External bands and guest musicians pay a single flat ₹500 Razorpay fee covering all reserved slots for that entire day.
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-white/5 space-y-1.5 sm:space-y-2">
          <h3 className="font-bold text-xs sm:text-sm text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-yellow-400 shrink-0" />
            <span>Flexible Multi-Day Booking</span>
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed">
            Reserve slots across multiple dates in advance. No restrictions on scheduling separate practice sessions on different days.
          </p>
        </div>
      </div>

      {/* Reservation & Pass Confirmation Modal */}
      <BookingModal
        isOpen={isModalOpen}
        onClose={handleCloseBookingModal}
        slots={selectedSlots}
        availableSlots={(availability?.slots || []).filter((s) => s.status === 'AVAILABLE')}
        onSlotsChange={setSelectedSlots}
        date={selectedDate}
        onSuccess={handleBookingSuccess}
      />
    </div>
  );
};

export default JamRoomBookingPage;
