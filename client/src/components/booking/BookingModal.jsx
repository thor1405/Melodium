import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { bookingService } from '../../services/bookingService';
import { paymentService, loadRazorpayScript } from '../../services/paymentService';
import { RazorpayPaymentBadge } from './RazorpayPaymentBadge';
import { formatDate, formatTime12h } from '../../utils/dateUtils';
import confetti from 'canvas-confetti';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Radio,
  MapPin,
  ArrowRight,
  User,
  ShieldCheck,
  Mail,
  Ticket,
  Zap,
} from 'lucide-react';

export const BookingModal = ({ isOpen, onClose, slots = [], date, onSuccess }) => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const isOutsider =
    user?.userType === 'OUTSIDER' ||
    (!user?.email?.endsWith('@sjec.ac.in') && user?.role !== 'ADMIN');

  const [bookerName, setBookerName] = useState('');
  const [rulesAccepted, setRulesAccepted] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingResults, setBookingResults] = useState(null);

  useEffect(() => {
    if (isOpen && user) {
      setBookerName(user.name || '');
    }
  }, [isOpen, user]);

  if (!isOpen) return null;
  if (!bookingResults && (!slots || slots.length === 0 || !date)) return null;

  const totalHours = slots?.length || 0;

  const handleBookingSuccess = (res) => {
    confetti({
      particleCount: 110,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#ece75f', '#f59e0b', '#10b981', '#ffffff'],
    });

    const list = res.bookings || (res.booking ? [res.booking] : []);
    setBookingResults(list);
    toast.success(
      isOutsider
        ? `Payment of ₹500 via Razorpay Successful! Pass Confirmed for ${list.length} ${list.length === 1 ? 'Slot' : 'Slots'} 🎸`
        : `${list.length} ${list.length === 1 ? 'Slot' : 'Slots'} Reserved Successfully! 🎸`
    );
    if (onSuccess) onSuccess(res);
  };

  const handleBookingSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!bookerName.trim()) {
      toast.error('Please enter your name.');
      return;
    }

    if (!rulesAccepted) {
      toast.error('You must accept the Jam Room equipment & studio rules.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Process Razorpay Payment for External Musicians
      if (isOutsider && user?.role !== 'ADMIN') {
        const orderRes = await paymentService.createPaymentOrder({
          date,
          slots: slots.map((s) => ({ startTime: s.startTime, endTime: s.endTime })),
          bookerName: bookerName.trim(),
        });

        if (!orderRes.success) {
          throw new Error(orderRes.message || 'Failed to initialize payment order.');
        }

        const isScriptLoaded = await loadRazorpayScript();

        // Sandbox fallback for test mock mode / offline testing
        if (orderRes.isSandbox || !isScriptLoaded || !window.Razorpay) {
          const res = await bookingService.createBooking({
            date,
            slots: slots.map((s) => ({ startTime: s.startTime, endTime: s.endTime })),
            bookerName: bookerName.trim(),
            purpose: 'Jam Session',
            paymentMethod: 'RAZORPAY',
            razorpayOrderId: orderRes.orderId || `order_mock_${Date.now()}`,
            razorpayPaymentId: `pay_mock_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
            razorpaySignature: 'mock_signature_verified',
          });

          if (res.success) {
            handleBookingSuccess(res);
          }
          setIsSubmitting(false);
          return;
        }

        // Live / Test Razorpay Standard Popup Modal
        const options = {
          key: orderRes.keyId,
          amount: orderRes.amount,
          currency: orderRes.currency || 'INR',
          name: 'Melodium SJEC',
          description: `Jam Room Rehearsal Pass - ${date} (${slots.length} ${slots.length === 1 ? 'hr' : 'hrs'})`,
          image: '/logo.svg',
          order_id: orderRes.orderId,
          prefill: {
            name: bookerName.trim(),
            email: user?.email || '',
            contact: user?.phone || '',
          },
          notes: {
            date,
            slotsCount: slots.length,
            bookerName: bookerName.trim(),
          },
          theme: {
            color: '#f59e0b',
          },
          handler: async function (response) {
            try {
              setIsSubmitting(true);
              const res = await bookingService.createBooking({
                date,
                slots: slots.map((s) => ({ startTime: s.startTime, endTime: s.endTime })),
                bookerName: bookerName.trim(),
                purpose: 'Jam Session',
                paymentMethod: 'RAZORPAY',
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });

              if (res.success) {
                handleBookingSuccess(res);
              }
            } catch (createErr) {
              const msg =
                createErr.response?.data?.message || createErr.message || 'Payment confirmation failed.';
              toast.error(msg);
            } finally {
              setIsSubmitting(false);
            }
          },
          modal: {
            ondismiss: function () {
              setIsSubmitting(false);
              toast.info('Razorpay payment cancelled.');
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (resp) {
          setIsSubmitting(false);
          toast.error(resp.error?.description || 'Payment transaction failed.');
        });
        rzp.open();
        return;
      }

      // Free Pass for Verified SJEC Students
      const res = await bookingService.createBooking({
        date,
        slots: slots.map((s) => ({ startTime: s.startTime, endTime: s.endTime })),
        bookerName: bookerName.trim(),
        purpose: 'Jam Session',
        paymentMethod: 'STUDENT_FREE_PASS',
      });

      if (res.success) {
        handleBookingSuccess(res);
      }
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || 'Unable to complete reservation. Please try again.';
      toast.error(msg);
      if (err.response?.status === 409) {
        if (onSuccess) onSuccess(null);
        onClose();
      }
    } finally {
      if (!isOutsider || user?.role === 'ADMIN') {
        setIsSubmitting(false);
      }
    }
  };

  const resetAndClose = () => {
    setBookingResults(null);
    onClose();
  };

  const handleViewMyBookings = () => {
    resetAndClose();
    navigate('/my-bookings');
  };

  // Pinned footer for Form
  const formFooter = (
    <div className="flex items-center justify-end gap-3 w-full">
      <button
        type="button"
        onClick={resetAndClose}
        disabled={isSubmitting}
        className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
      >
        Cancel
      </button>
      <button
        type="submit"
        form="booking-modal-form"
        disabled={isSubmitting || !bookerName.trim()}
        className="px-5 sm:px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-dark-950 font-extrabold text-xs shadow-glow-yellow transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center gap-2 cursor-pointer"
      >
        {isSubmitting ? (
          <>
            <span className="w-3.5 h-3.5 border-2 border-dark-950/30 border-t-dark-950 rounded-full animate-spin" />
            <span>{isOutsider ? 'Opening Razorpay...' : 'Confirming...'}</span>
          </>
        ) : (
          <>
            <span>{isOutsider ? 'Pay ₹500 via Razorpay & Confirm' : 'Confirm Booking'}</span>
            <ArrowRight className="w-3.5 h-3.5 text-dark-950 stroke-[3]" />
          </>
        )}
      </button>
    </div>
  );

  // Pinned footer for Success Screen
  const successFooter = (
    <div className="flex flex-col sm:flex-row items-center justify-end gap-3 w-full">
      <button
        type="button"
        onClick={handleViewMyBookings}
        className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 hover:text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
      >
        <Ticket className="w-4 h-4 text-amber-400" />
        <span>My Passes</span>
      </button>

      <button
        type="button"
        onClick={resetAndClose}
        className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-dark-950 font-extrabold text-xs shadow-glow-yellow flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
      >
        <span>Done</span>
        <ArrowRight className="w-4 h-4 stroke-[3]" />
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={resetAndClose}
      title={bookingResults ? 'Booking Confirmed! 🎉' : isOutsider ? 'Book Jam Room (Razorpay Checkout)' : 'Book Jam Room'}
      subtitle={bookingResults ? 'Pass Issued' : 'Studio'}
      maxWidth="max-w-xl"
      footer={bookingResults ? successFooter : formFooter}
    >
      {bookingResults ? (
        /* ================= SUCCESS POPUP SCREEN ================= */
        <div className="py-2 space-y-4">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-amber-400 to-yellow-300 p-0.5 mx-auto shadow-glow-emerald">
              <div className="w-full h-full bg-dark-950 rounded-[14px] flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-emerald-400 animate-bounce" />
              </div>
            </div>

            <h3 className="text-lg sm:text-xl font-extrabold font-display text-white tracking-wide">
              Booking Confirmed! 🎉
            </h3>
            <p className="text-xs text-slate-300">
              Reserved for <span className="text-amber-300 font-bold">{formatDate(date, 'EEEE, dd MMM yyyy')}</span>
            </p>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold">
              <Mail className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate max-w-xs sm:max-w-md">Confirmation email sent to {user?.email}</span>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-950/40 via-dark-900 to-yellow-950/30 border border-amber-500/30 text-left space-y-3.5 relative overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Official Studio Pass
                </span>
              </div>
              <span
                className={`text-[10px] sm:text-[11px] font-bold px-2.5 sm:px-3 py-0.5 rounded-full ${
                  isOutsider
                    ? 'bg-amber-400 text-dark-950 shadow-sm'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                {isOutsider ? '₹500 Paid via Razorpay' : 'SJEC Student (100% Free)'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Rehearsal Date</span>
                <span className="font-bold text-white text-sm">{formatDate(date, 'dd MMM yyyy')}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Booked By</span>
                <span className="font-bold text-amber-300 text-sm truncate block">{bookerName || user?.name}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">
                Reserved Slot{bookingResults.length > 1 ? 's' : ''} ({bookingResults.length})
              </span>
              <div className="flex flex-wrap gap-2">
                {bookingResults.map((b) => (
                  <div
                    key={b.bookingId || b._id}
                    className="px-2.5 py-1.5 rounded-xl bg-dark-950/80 border border-amber-400/30 text-white font-mono text-xs flex items-center gap-2 shadow-sm"
                  >
                    <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="font-semibold">{formatTime12h(b.startTime)} – {formatTime12h(b.endTime)}</span>
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                      {b.bookingId}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 text-xs">
              <div className="flex items-center gap-1 text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="font-semibold">Academic Block 3, Ground Floor (Jam Room)</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ================= BOOKING FORM SCREEN ================= */
        <form id="booking-modal-form" onSubmit={handleBookingSubmit} className="space-y-3.5">
          {/* Selected Slots Summary Banner */}
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-display font-bold text-sm text-white">
                  {formatDate(date, 'EEEE, dd MMMM yyyy')}
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-dark-950 text-[10px] font-extrabold">
                {totalHours} {totalHours === 1 ? 'Slot' : 'Slots'}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {slots.map((s) => (
                <div
                  key={s.startTime}
                  className="px-2.5 py-1 rounded-xl bg-dark-950/70 border border-amber-400/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>
                    {formatTime12h(s.startTime)} – {formatTime12h(s.endTime)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Row */}
          <div
            className={`px-3.5 py-2.5 rounded-xl border flex items-center justify-between text-xs ${
              isOutsider
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <ShieldCheck
                className={`w-4 h-4 shrink-0 ${isOutsider ? 'text-amber-400' : 'text-emerald-400'}`}
              />
              <span className="font-bold text-white text-xs">
                {isOutsider ? 'External Musician Day Pass' : 'SJEC Student Free Pass'}
              </span>
            </div>
            <span
              className={`font-extrabold text-sm ${
                isOutsider ? 'text-amber-400 font-display' : 'text-emerald-400 font-display'
              }`}
            >
              {isOutsider ? '₹500' : '₹0 Free'}
            </span>
          </div>

          {/* Booker Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span>Name</span>
            </label>
            <input
              type="text"
              required
              value={bookerName}
              onChange={(e) => setBookerName(e.target.value)}
              placeholder="Your Name"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
            />
          </div>

          {/* Outsider Razorpay Gateway Badge */}
          {isOutsider && (
            <div className="space-y-1.5 pt-1">
              <RazorpayPaymentBadge />
            </div>
          )}

          {/* Rules Checkbox */}
          <div className="p-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2 text-xs text-slate-300">
            <input
              type="checkbox"
              id="rules"
              checked={rulesAccepted}
              onChange={(e) => setRulesAccepted(e.target.checked)}
              className="rounded border-slate-700 bg-dark-900 text-amber-500 focus:ring-0 cursor-pointer"
            />
            <label htmlFor="rules" className="cursor-pointer text-xs select-none text-slate-300">
              I agree to the Jam Room rules and equipment care guidelines.
            </label>
          </div>
        </form>
      )}
    </Modal>
  );
};
