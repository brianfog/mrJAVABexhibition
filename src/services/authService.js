import {
  apiRequest,
  getChatTokenFromUser,
  setToken,
  setChatToken,
  removeToken,
} from './api';

export const authService = {
  sendOTP: async (mobile, recaptchaToken = 'TEST') => {
    console.log(recaptchaToken);
    return apiRequest('/send-otp', {
      method: 'POST',
      body: {
        mobile: mobile.replace('0', ''),
        recaptcha_token: 'TEST',
      },
    });
  },

  verifyOTP: async (mobile, otp, recaptchaToken = 'TEST') => {
    console.log(recaptchaToken);
    const response = await apiRequest('/verify-otp', {
      method: 'POST',
      body: {
        mobile: mobile.replace('0', ''),
        otp,
        recaptcha_token: 'TEST',
      },
    });

    if (response.token) {
      setToken(response.token);
    }

    const chatToken =
      getChatTokenFromUser(response.user) ||
      getChatTokenFromUser(response.data?.user);

    if (chatToken) {
      setChatToken(chatToken);
    }

    return response;
  },

  getProfile: async () => {
    return apiRequest('/profile', {
      method: 'GET',
    });
  },

  logout: async () => {
    try {
      await apiRequest('/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      removeToken();
    }
  },
};
