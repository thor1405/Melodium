import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { bookingService } from '../../services/bookingService';
import { paymentService } from '../../services/paymentService';
import { StripePaymentForm } from './StripePaymentForm';
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
} from 'lucide-react';

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ||
    'pk_test_51MelodiumSjecTestKey2026JamRoomPassPubKey999'
);

const BookingModalForm = ({ isOpen, onClose, slots = [], date, onSuccess }) => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const stripe = useStripe();
  const elements = useElements();

  const isOutsider =
    user?.userType === 'OUTSIDER' ||
    (!user?.email?.endsWith('@sjec.ac.in') && user?.role !== 'ADMIN');

  const [bookerName, setBookerName] = useState('');
  const [rulesAccepted, setRulesAccepted] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cardError, setCardError] = useState('');
  const [bookingResults, setBookingResults] = useState(null);

  useEffect(() => {
    if (isOpen && user) {
      setBookerName(user.name || '');
    }
  }, [isOpen, user]);

  if (!isOpen) return null;
  if (!bookingResults && (!slots || slots.length === 0 || !date)) return null;

  const totalHours = slots?.length || 0;

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
    setCardError('');

    try {
      let paymentIntentId = '';

      // Process Stripe Payment for External Musicians
      if (isOutsider && user?.role !== 'ADMIN') {
        const intentRes = await paymentService.createPaymentIntent({
          date,
          slots: slots.map((s) => ({ startTime: s.startTime, endTime: s.endTime })),
          bookerName: bookerName.trim(),
        });

        if (!intentRes.success) {
          throw new Error(intentRes.message || 'Failed to initialize payment.');
        }

        const { clientSecret, isSandbox, paymentIntentId: mockId } = intentRes;

        if (isSandbox || !stripe || !elements) {
          paymentIntentId = mockId || `pi_sandbox_${Date.now()}`;
        } else {
          const cardElement = elements.getElement(CardElement);
          if (!cardElement) {
            throw new Error('Please enter your card details.');
          }

          const paymentResult = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
              card: cardElement,
              billing_details: {
                name: bookerName.trim(),
                email: user?.email,
              },
            },
          });

          if (paymentResult.error) {
            setCardError(paymentResult.error.message || 'Payment failed.');
            toast.error(paymentResult.error.message || 'Card payment failed.');
            setIsSubmitting(false);
            return;
          }

          if (paymentResult.paymentIntent.status !== 'succeeded') {
            setCardError('Payment was not completed. Please try again.');
            toast.error('Payment was not completed.');
            setIsSubmitting(false);
            return;
          }

          paymentIntentId = paymentResult.paymentIntent.id;
        }
      }

      // Create Booking in backend
      const res = await bookingService.createBooking({
        date,
        slots: slots.map((s) => ({ startTime: s.startTime, endTime: s.endTime })),
        bookerName: bookerName.trim(),
        purpose: 'Jam Session',
        paymentMethod: isOutsider ? 'STRIPE' : 'STUDENT_FREE_PASS',
        paymentIntentId,
      });

      if (res.success) {
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
            ? `Payment of ₹500 Successful! Pass Confirmed for ${list.length} ${list.length === 1 ? 'Slot' : 'Slots'} 🎸`
            : `${list.length} ${list.length === 1 ? 'Slot' : 'Slots'} Reserved Successfully! 🎸`
        );
        if (onSuccess) onSuccess(res);
      }
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || 'Unable to complete reservation. Please try again.';
      toast.error(msg);
      setCardError(msg);
      if (err.response?.status === 409) {
        if (onSuccess) onSuccess(null);
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setBookingResults(null);
    setCardError('');
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
            <span>{isOutsider ? 'Processing Payment...' : 'Confirming...'}</span>
          </>
        ) : (
          <>
            <span>{isOutsider ? 'Pay ₹500 via Stripe & Confirm' : 'Confirm Booking'}</span>
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
      title={bookingResults ? 'Booking Confirmed! 🎉' : isOutsider ? 'Book Jam Room (Stripe Checkout)' : 'Book Jam Room'}
      subtitle={bookingResults ? 'Pass Issued' : 'Studio 1'}
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
                {isOutsider ? '₹500 Paid via Stripe' : 'SJEC Student (100% Free)'}
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
                <span className="font-semibold">Activity Block, 2nd Floor (Studio 1)</span>
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

          {/* Outsider Stripe Card Checkout Element */}
          {isOutsider && (
            <div className="space-y-1.5 pt-1">
              <StripePaymentForm
                onCardChange={(e) => {
                  if (e.error) setCardError(e.error.message);
                  else setCardError('');
                }}
                error={cardError}
              />
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

export const BookingModal = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <BookingModalForm {...props} />
    </Elements>
  );
};
