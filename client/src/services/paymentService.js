import api from './api';

export const paymentService = {
  getConfig: async () => {
    const res = await api.get('/payments/config');
    return res.data;
  },

  createPaymentIntent: async (data) => {
    const res = await api.post('/payments/create-payment-intent', data);
    return res.data;
  },
};
