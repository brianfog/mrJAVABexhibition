import { apiRequest } from './api';

export const paymentService = {
  // Initiate payment for a plan
  initiatePayment: async (planId) => {
    const response = await apiRequest(`/order/pay/${planId}`, {
      method: 'GET',
    });
    return response;
  },

  // Verify payment callback from Zarinpal
  verifyPayment: async (orderId, authority, status) => {
    const response = await apiRequest(
      `/payment/callback?order=${orderId}&Authority=${authority}&Status=${status}`,
      {
        method: 'GET',
      }
    );
    return response;
  },
};
