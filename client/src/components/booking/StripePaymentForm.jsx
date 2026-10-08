import React from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CreditCard, Lock, AlertCircle } from 'lucide-react';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#ffffff',
      fontFamily: 'Inter, sans-serif',
      fontSize: '14px',
      '::placeholder': {
        color: '#64748b',
      },
      iconColor: '#f59e0b',
    },
    invalid: {
      color: '#f87171',
      iconColor: '#f87171',
    },
  },
  hidePostalCode: true,
};

export const StripePaymentForm = ({ onCardChange, error }) => {
  const stripe = useStripe();
  const elements = useElements();

  return (
    <div className="space-y-2.5 p-3.5 rounded-2xl bg-dark-900/90 border border-amber-500/25 shadow-inner">
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center gap-2 text-xs font-bold text-white">
          <CreditCard className="w-4 h-4 text-amber-400" />
          <span>Card Details (Stripe Secure)</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
          <Lock className="w-3 h-3" />
          <span>256-bit Encrypted</span>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-white/5 border border-white/10 focus-within:border-amber-400 focus-within:ring-1 focus-within:ring-amber-400 transition-all">
        <CardElement
          options={CARD_ELEMENT_OPTIONS}
          onChange={(e) => {
            if (onCardChange) onCardChange(e);
          }}
        />
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-rose-400 font-medium pt-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
        <span>Day Pass Fee: <strong className="text-amber-400 font-display">₹500 INR</strong></span>
        <span className="text-[10px] text-slate-500">Powered by Stripe Payments</span>
      </div>
    </div>
  );
};
