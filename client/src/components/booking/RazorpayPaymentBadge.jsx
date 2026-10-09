import React from 'react';
import { CreditCard, Lock, Zap, CheckCircle2, ShieldCheck, QrCode } from 'lucide-react';

export const RazorpayPaymentBadge = () => {
  return (
    <div className="space-y-3 p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-dark-900 to-dark-950 border border-amber-500/30 shadow-inner">
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center gap-2 text-xs font-bold text-white">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Payment Gateway (Razorpay)</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>RBI Compliant • 256-Bit Encrypted</span>
        </div>
      </div>

      {/* Payment methods pill icons */}
      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2 text-slate-200">
          <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 font-black text-[10px] flex items-center justify-center">
            UPI
          </span>
          <div>
            <div className="font-bold text-xs text-white">UPI & QR Code</div>
            <div className="text-[10px] text-slate-400">GPay, PhonePe, Paytm</div>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2 text-slate-200">
          <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-300 font-black text-[10px] flex items-center justify-center">
            <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
          </span>
          <div>
            <div className="font-bold text-xs text-white">Cards & RuPay</div>
            <div className="text-[10px] text-slate-400">Credit / Debit Cards</div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-300 pt-1">
        <span className="text-slate-400">Jam Room Day Pass:</span>
        <span className="text-amber-400 font-display font-extrabold text-sm">₹500 INR</span>
      </div>

      <p className="text-[10px] text-slate-400 leading-relaxed">
        Clicking confirm will securely open the Razorpay payment window to complete checkout via your preferred UPI app, QR code, or card.
      </p>
    </div>
  );
};

export default RazorpayPaymentBadge;
