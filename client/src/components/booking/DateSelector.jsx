import React, { useState, useEffect } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  isBefore,
  isAfter,
  startOfDay,
  addDays,
  getDay,
} from 'date-fns';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Radio,
  CheckCircle2,
  CalendarDays,
  Clock,
  Lock,
  Ban,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDate } from '../../utils/dateUtils';

const parseLocalDay = (dateStr) => {
  if (!dateStr) return null;
  return typeof dateStr === 'string' && !dateStr.includes('T')
    ? startOfDay(new Date(`${dateStr}T00:00:00`))
    : startOfDay(new Date(dateStr));
};

export const DateSelector = ({
  selectedDate,
  onSelectDate,
  availableDays = [0, 1, 2, 3, 4, 5, 6],
}) => {
  const today = startOfDay(new Date());
  const maxDate = startOfDay(addMonths(today, 1)); // Exactly 1 month from today (e.g. Oct 2 -> Nov 2)

  const minMonth = startOfMonth(today);
  const maxMonth = startOfMonth(maxDate);

  const [currentMonth, setCurrentMonth] = useState(() => {
    if (selectedDate) {
      const selected = parseLocalDay(selectedDate);
      if (selected && !isNaN(selected.getTime()) && !isBefore(selected, today) && !isAfter(selected, maxDate)) {
        return selected;
      }
    }
    return today;
  });

  // Keep month in sync if selectedDate changes externally
  useEffect(() => {
    if (selectedDate) {
      const selected = parseLocalDay(selectedDate);
      if (selected && !isNaN(selected.getTime())) {
        setCurrentMonth(selected);
      }
    }
  }, [selectedDate]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekDays = [
    { label: 'SUN', dayIndex: 0 },
    { label: 'MON', dayIndex: 1 },
    { label: 'TUE', dayIndex: 2 },
    { label: 'WED', dayIndex: 3 },
    { label: 'THU', dayIndex: 4 },
    { label: 'FRI', dayIndex: 5 },
    { label: 'SAT', dayIndex: 6 },
  ];

  const canGoPrev = isAfter(startOfMonth(currentMonth), minMonth);
  const canGoNext = isBefore(startOfMonth(currentMonth), maxMonth);

  const isSundayOpen = availableDays.includes(0);

  const handlePrevMonth = () => {
    if (canGoPrev) {
      setCurrentMonth((prev) => subMonths(prev, 1));
    }
  };

  const handleNextMonth = () => {
    if (canGoNext) {
      setCurrentMonth((prev) => addMonths(prev, 1));
    }
  };

  const handleJumpToday = () => {
    let targetDay = today;
    if (!availableDays.includes(getDay(today))) {
      // If today is closed (e.g. Sunday), move forward to first open day
      for (let i = 1; i <= 7; i++) {
        const nextDay = addDays(today, i);
        if (availableDays.includes(getDay(nextDay))) {
          targetDay = nextDay;
          break;
        }
      }
    }
    const targetStr = format(targetDay, 'yyyy-MM-dd');
    setCurrentMonth(targetDay);
    onSelectDate(targetStr);
  };

  const formattedSelected = selectedDate
    ? formatDate(selectedDate, 'EEEE, dd MMMM yyyy')
    : 'No Date Selected';

  return (
    <div className="w-full glass-panel-elevated rounded-3xl p-5 sm:p-7 border border-amber-500/20 shadow-2xl space-y-6">
      {/* 1. Header: Month Navigation & Rolling 1-Month Window Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-glow-yellow">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display font-extrabold text-xl sm:text-2xl text-white tracking-wide">
                {format(currentMonth, 'MMMM yyyy')}
              </h2>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm">
                1-Month Window ({format(today, 'dd MMM')} – {format(maxDate, 'dd MMM')})
              </span>
              {!isSundayOpen ? (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 shadow-sm">
                  Sundays Closed (Holiday)
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm">
                  All 7 Days Open
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {!isSundayOpen
                ? 'Open Mon–Sat for rehearsals. Sundays are weekly holidays.'
                : 'Open 7 days a week (including Sundays) for band rehearsals.'}
            </p>
          </div>
        </div>

        {/* Month Navigation Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleJumpToday}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all"
          >
            Today
          </button>

          <div className="flex items-center gap-1 bg-dark-900 rounded-xl p-1 border border-white/10">
            <button
              type="button"
              onClick={handlePrevMonth}
              disabled={!canGoPrev}
              title={canGoPrev ? 'Previous Month' : 'Past months are locked'}
              className={`p-2 rounded-lg transition-colors ${
                canGoPrev
                  ? 'hover:bg-white/10 text-slate-300 hover:text-amber-400 cursor-pointer'
                  : 'text-slate-600 opacity-30 cursor-not-allowed'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              disabled={!canGoNext}
              title={canGoNext ? 'Next Month' : 'Dates beyond 1 month are locked'}
              className={`p-2 rounded-lg transition-colors ${
                canGoNext
                  ? 'hover:bg-white/10 text-slate-300 hover:text-amber-400 cursor-pointer'
                  : 'text-slate-600 opacity-30 cursor-not-allowed'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Calendar Grid with 1-Month Range & Operating Days */}
      <div className="space-y-2">
        {/* Day-of-Week Column Headers */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center">
          {weekDays.map((day) => {
            const isClosed = !availableDays.includes(day.dayIndex);
            return (
              <div
                key={day.label}
                className={`text-[11px] font-bold tracking-wider py-1 uppercase ${
                  isClosed ? 'text-rose-400 font-extrabold' : 'text-slate-400'
                }`}
              >
                {day.label}{' '}
                {isClosed && (
                  <span className="text-[9px] block text-rose-400/60 font-normal">Off</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Days Matrix */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5">
          {calendarDays.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const isSelected = selectedDate === dateStr;
            const isCurrentMonthDay = isSameMonth(day, currentMonth);
            const isPastDay = isBefore(startOfDay(day), today);
            const isFutureExceeded = isAfter(startOfDay(day), maxDate);
            const isClosedDay = !availableDays.includes(getDay(day));
            const isDayToday = isToday(day);
            const isDayTomorrow = isSameDay(day, addDays(today, 1));

            // Out-of-month placeholder
            if (!isCurrentMonthDay) {
              return (
                <div
                  key={dateStr}
                  className="min-h-[64px] sm:min-h-[82px] rounded-2xl bg-white/[0.01] border border-transparent p-2 opacity-10 pointer-events-none flex flex-col justify-between"
                >
                  <span className="text-xs font-mono text-slate-700">{format(day, 'd')}</span>
                </div>
              );
            }

            // Closed Day / Weekly Holiday (e.g. Sunday when disabled)
            if (isClosedDay) {
              return (
                <div
                  key={dateStr}
                  className="min-h-[64px] sm:min-h-[82px] rounded-2xl bg-rose-950/20 border border-rose-500/15 p-2 sm:p-2.5 opacity-50 cursor-not-allowed flex flex-col justify-between text-rose-300/70 select-none"
                  title="Studio closed on this day (Weekly Holiday)"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-display text-sm sm:text-base font-extrabold text-rose-400/80">
                      {format(day, 'dd')}
                    </span>
                    <span className="px-1.5 py-0.5 rounded-md bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[8px] font-black uppercase tracking-wider">
                      Holiday
                    </span>
                  </div>
                  <div className="flex items-center justify-between w-full text-[10px] mt-1">
                    <span className="text-slate-500">{format(day, 'MMM')}</span>
                    <span className="text-[9px] font-bold uppercase text-rose-400/80 flex items-center gap-0.5">
                      <Ban className="w-2.5 h-2.5" /> Closed
                    </span>
                  </div>
                </div>
              );
            }

            // Past Days (Before Today) - NOT Selectable
            if (isPastDay) {
              return (
                <div
                  key={dateStr}
                  className="min-h-[64px] sm:min-h-[82px] rounded-2xl bg-white/[0.01] border border-white/5 p-2 opacity-25 cursor-not-allowed flex flex-col justify-between text-slate-600 select-none"
                  title="Past dates are unavailable"
                >
                  <span className="text-xs font-mono font-medium">{format(day, 'dd')}</span>
                  <span className="text-[9px] uppercase tracking-wider text-slate-600 font-semibold">
                    Past
                  </span>
                </div>
              );
            }

            // Future Days Beyond 1 Month - NOT Selectable
            if (isFutureExceeded) {
              return (
                <div
                  key={dateStr}
                  className="min-h-[64px] sm:min-h-[82px] rounded-2xl bg-white/[0.01] border border-white/5 p-2 opacity-25 cursor-not-allowed flex flex-col justify-between text-slate-600 select-none"
                  title="Outside 1-month booking window"
                >
                  <span className="text-xs font-mono font-medium">{format(day, 'dd')}</span>
                  <span className="text-[9px] uppercase tracking-wider text-slate-600 font-semibold flex items-center gap-0.5">
                    <Lock className="w-2.5 h-2.5" /> Locked
                  </span>
                </div>
              );
            }

            // Active / Selectable Days (Open day within 1-Month Window)
            return (
              <motion.button
                key={dateStr}
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectDate(dateStr)}
                className={`min-h-[64px] sm:min-h-[82px] rounded-2xl border p-2 sm:p-2.5 flex flex-col justify-between text-left transition-all duration-200 relative group cursor-pointer select-none ${
                  isSelected
                    ? 'bg-gradient-to-br from-amber-500/30 via-yellow-500/20 to-amber-950/80 border-amber-400 text-white shadow-glow-yellow ring-1 ring-amber-400'
                    : 'bg-dark-900/90 hover:bg-dark-850 border-white/10 hover:border-amber-400/50 text-slate-300 hover:text-white'
                }`}
              >
                {/* Top Row: Date & Status Badge */}
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`font-display text-sm sm:text-base font-extrabold ${
                      isSelected
                        ? 'text-amber-300 text-glow-yellow'
                        : isDayToday
                        ? 'text-amber-400'
                        : 'text-white'
                    }`}
                  >
                    {format(day, 'dd')}
                  </span>

                  {isDayToday && (
                    <span className="px-1.5 py-0.5 rounded-md bg-amber-500 text-dark-950 text-[8px] font-black uppercase tracking-wider shadow-sm">
                      Today
                    </span>
                  )}

                  {isDayTomorrow && !isSelected && (
                    <span className="hidden sm:inline-block px-1.5 py-0.5 rounded-md bg-white/10 text-slate-300 text-[8px] font-bold uppercase">
                      Tmrw
                    </span>
                  )}

                  {isSelected && (
                    <span className="w-4 h-4 rounded-full bg-amber-400 text-dark-950 flex items-center justify-center">
                      <CheckCircle2 className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>

                {/* Bottom Row: Month & Status */}
                <div className="flex items-center justify-between w-full text-[10px] mt-1">
                  <span
                    className={`${isSelected ? 'text-amber-200 font-semibold' : 'text-slate-400'}`}
                  >
                    {format(day, 'MMM')}
                  </span>
                  <span
                    className={`hidden sm:inline-block text-[9px] font-medium uppercase ${
                      isSelected
                        ? 'text-amber-300 font-bold'
                        : 'text-emerald-400 group-hover:text-emerald-300'
                    }`}
                  >
                    {isSelected ? 'Selected' : 'Open'}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* 3. Selected Rehearsal Date Summary Banner */}
      <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-400 p-0.5 shadow-glow-yellow shrink-0">
            <div className="w-full h-full bg-dark-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Viewing Slot Availability For
            </div>
            <div className="text-sm sm:text-base font-display font-black text-white">
              {formattedSelected}
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-400 sm:text-right">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-semibold">
            <Radio className="w-3 h-3 animate-pulse" />
            Book multiple slots on this day
          </span>
        </div>
      </div>
    </div>
  );
};
