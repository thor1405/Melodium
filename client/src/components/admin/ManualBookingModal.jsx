import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useToast } from '../../context/ToastContext';
import { adminService } from '../../services/adminService';
import { getTodayString } from '../../utils/dateUtils';

export const ManualBookingModal = ({ isOpen, onClose, defaultDate, defaultSlot, onSuccess }) => {
  const toast = useToast();
  const [date, setDate] = useState(defaultDate || getTodayString());
  const [startTime, setStartTime] = useState(defaultSlot?.startTime || '10:00');
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [purpose, setPurpose] = useState('Official College Band Session');
  const [participantCount, setParticipantCount] = useState(4);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!purpose.trim()) {
      toast.error('Please enter the purpose of the reservation.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await adminService.createAdminBooking({
        date,
        startTime,
        studentName,
        studentEmail,
        purpose: purpose.trim(),
        participantCount: Number(participantCount),
        notes,
      });

      if (res.success) {
        toast.success('Booking registered successfully!');
        if (onSuccess) onSuccess(res.booking);
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create booking.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Admin Manual Reservation"
      subtitle="Register an official band session or walk-in student booking"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-200">Date *</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-purple"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-200">Start Time *</label>
            <input
              type="time"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-purple"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-200">Student Name / Group</label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="e.g. Melodium Core Rock Band"
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-brand-purple"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-200">Student Email (Optional)</label>
            <input
              type="email"
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
              placeholder="student@sjec.ac.in"
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-brand-purple"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-200">Purpose / Session Topic *</label>
          <input
            type="text"
            required
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-purple"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-200">Participants</label>
            <input
              type="number"
              min="1"
              max="15"
              value={participantCount}
              onChange={(e) => setParticipantCount(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-purple"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-200">Admin Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Sound Engineer on standby"
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-brand-purple"
            />
          </div>
        </div>

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
            className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-glow-purple transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Reserve Studio Slot'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
