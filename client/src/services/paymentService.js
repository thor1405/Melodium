import api from './api';

export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const paymentService = {
  getConfig: async () => {
    const res = await api.get('/payments/config');
    return res.data;
  },

  createPaymentOrder: async (data) => {
    const res = await api.post('/payments/create-order', data);
    return res.data;
  },

  createPaymentIntent: async (data) => {
    const res = await api.post('/payments/create-order', data);
    return res.data;
  },
};

