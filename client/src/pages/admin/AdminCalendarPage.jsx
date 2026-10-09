import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { formatDate, getTodayString } from '../../utils/dateUtils';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/common/Modal';
import { BookingPassCard } from '../../components/booking/BookingPassCard';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Radio,
  Lock,
  Ban,
} from 'lucide-react';
import { addDays, startOfWeek, format, isSameDay } from 'date-fns';

export const AdminCalendarPage = () => {
  const toast = useToast();
  const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedDay, setSelectedDay] = useState(getTodayString());
  const [daySchedule, setDaySchedule] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  const fetchDay = async (dateStr) => {
    setLoading(true);
    try {
      const res = await adminService.getTodaySchedule(dateStr);
      if (res.success) {
        setDaySchedule(res.data.schedule || []);
      }
    } catch (err) {
      toast.error('Failed to load day schedule.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDay(selectedDay);
  }, [selectedDay]);

  const handlePrevWeek = () => {
    setCurrentWeekStart((prev) => addDays(prev, -7));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart((prev) => addDays(prev, 7));
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header & Week Nav */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-white/5">
        <div>
          <h2 className="text-lg sm:text-xl font-bold font-display text-white">
            Studio Calendar Schedule
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Week of {format(currentWeekStart, 'dd MMMM yyyy')}
          </p>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 self-start sm:self-auto">
          <button
            onClick={handlePrevWeek}
            className="p-1.5 sm:p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              const now = new Date();
              setCurrentWeekStart(startOfWeek(now, { weekStartsOn: 1 }));
              setSelectedDay(getTodayString());
            }}
            className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white border border-white/10"
          >
            Today
          </button>
          <button
            onClick={handleNextWeek}
            className="p-1.5 sm:p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Week Day Strips */}
      <div className="grid grid-cols-7 gap-1 sm:gap-3">
        {weekDays.map((d) => {
          const dateStr = format(d, 'yyyy-MM-dd');
          const isSelected = selectedDay === dateStr;
          const isTodayDate = isSameDay(d, new Date());

          return (
            <button
              key={dateStr}
              onClick={() => setSelectedDay(dateStr)}
              className={`p-1.5 sm:p-4 rounded-xl sm:rounded-2xl border text-center transition-all ${
                isSelected
                  ? 'bg-amber-500/25 border-amber-400 shadow-glow-yellow scale-[1.02] text-white ring-1 ring-amber-400'
                  : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <div className="text-[9px] sm:text-[11px] uppercase font-bold tracking-wider">
                <span className="sm:hidden">{format(d, 'EEEEE')}</span>
                <span className="hidden sm:inline">{format(d, 'EEE')}</span>
              </div>
              <div className={`text-sm sm:text-2xl font-display font-black my-0.5 sm:my-1 ${isSelected ? 'text-amber-300' : 'text-white'}`}>
                {format(d, 'dd')}
              </div>
              {isTodayDate && (
                <span className="hidden sm:inline-block text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-amber-500 text-dark-950 uppercase">
                  Today
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Slots for Selected Day */}
      <div className="glass-panel-elevated rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-white/10 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <h3 className="font-bold text-xs sm:text-sm text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Time Slots for {formatDate(selectedDay, 'EEEE, dd MMMM yyyy')}</span>
          </h3>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs">Loading schedule...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3.5">
            {daySchedule.map((slot) => {
              const isAvailable = slot.status === 'AVAILABLE';
              const isBooked = slot.status === 'BOOKED';
              const isBlocked = slot.status === 'BLOCKED';

              return (
                <div
                  key={slot.startTime}
                  className={`p-3 sm:p-4 rounded-2xl border text-xs space-y-2 flex flex-col justify-between ${
                    isBooked
                      ? 'bg-amber-950/30 border-amber-500/30 text-amber-200'
                      : isBlocked
                      ? 'bg-rose-950/30 border-rose-500/30 text-rose-200'
                      : isAvailable
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                      : 'bg-white/5 border-white/5 text-slate-400 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="font-display text-xs sm:text-sm text-white font-mono">
                      {slot.startTime} – {slot.endTime}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] uppercase font-extrabold ${
                        isBooked
                          ? 'bg-amber-500/20 text-amber-300'
                          : isBlocked
                          ? 'bg-rose-500/20 text-rose-300'
                          : isAvailable
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-white/5 text-slate-500'
                      }`}
                    >
                      {slot.status}
                    </span>
                  </div>

                  <div>
                    {isBooked && (
                      <div>
                        <div className="font-semibold text-white truncate">
                          {slot.student?.name || 'Reserved'}
                        </div>
                        <div className="text-[10px] text-slate-400 italic truncate">
                          "{slot.purpose}"
                        </div>
                      </div>
                    )}
                    {isBlocked && (
                      <div className="text-[11px] text-rose-300 truncate">{slot.reason}</div>
                    )}
                    {isAvailable && (
                      <div className="text-[11px] text-emerald-400 font-medium">Slot Open</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
