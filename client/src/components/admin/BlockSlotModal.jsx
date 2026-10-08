import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useToast } from '../../context/ToastContext';
import { adminService } from '../../services/adminService';
import { formatDate, getTodayString } from '../../utils/dateUtils';
import { Ban, AlertTriangle } from 'lucide-react';

export const BlockSlotModal = ({ isOpen, onClose, defaultDate, defaultSlot, onSuccess }) => {
  const toast = useToast();
  const [date, setDate] = useState(defaultDate || getTodayString());
  const [startTime, setStartTime] = useState(defaultSlot?.startTime || '12:00');
  const [endTime, setEndTime] = useState(defaultSlot?.endTime || '13:00');
  const [isAllDay, setIsAllDay] = useState(false);
  const [reason, setReason] = useState('Amp Grounding & Drum Tuning Maintenance');
  const [category, setCategory] = useState('MAINTENANCE');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error('Please specify the reason for blocking this slot.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await adminService.blockSlot({
        date,
        startTime,
        endTime,
        isAllDay,
        reason: reason.trim(),
        category,
      });

      if (res.success) {
        toast.success('Jam Room slot has been blocked.');
        if (onSuccess) onSuccess(res.blockedSlot);
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to block slot.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Block Jam Room Time Slot"
      subtitle="Restrict student bookings for maintenance, rehearsals or college fests"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Date */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-200">Date *</label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-purple"
          />
        </div>

        {/* All Day Toggle */}
        <div className="flex items-center gap-2 py-1">
          <input
            type="checkbox"
            id="allDay"
            checked={isAllDay}
            onChange={(e) => setIsAllDay(e.target.checked)}
            className="rounded border-slate-700 bg-dark-900 text-rose-500 focus:ring-0"
          />
          <label htmlFor="allDay" className="text-xs text-slate-300 font-medium cursor-pointer">
            Block entire day (All operating hours)
          </label>
        </div>

        {/* Timing */}
        {!isAllDay && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-purple"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-purple"
              />
            </div>
          </div>
        )}

        {/* Category */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-200">Block Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-dark-900 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-purple"
          >
            <option value="MAINTENANCE">Studio Maintenance / Equipment Repair</option>
            <option value="COLLEGE_EVENT">SJEC College Event / Cultural Practice</option>
            <option value="BAND_PRACTICE">Official Melodium Core Band Session</option>
            <option value="SOUND_CHECK">Audio Engineering & Sound Check</option>
            <option value="HOLIDAY">College Holiday / Campus Closed</option>
            <option value="OTHER">Other Administrator Block</option>
          </select>
        </div>

        {/* Reason */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-200">
            Public Notice Reason (Visible to students) *
          </label>
          <input
            type="text"
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Weekly Sound Mixing Console Calibration"
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-brand-purple"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Blocking Slot...' : 'Block Time Slot'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
