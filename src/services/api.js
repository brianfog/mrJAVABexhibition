const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://mrjavab.com/api';

const getToken = () => {
  return localStorage.getItem('auth_token');
};

const getChatToken = () => {
  return localStorage.getItem('chat_token');
};

const getChatTokenFromUser = (user) => {
  return user?.token || null;
};

const setToken = (token) => {
  localStorage.setItem('auth_token', token);
};

const setChatToken = (token) => {
  localStorage.setItem('chat_token', token);
};

const removeToken = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('chat_token');
};
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
      });
      const errorMessage =
        errorData.error ||
        errorData.message ||
        `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    if (
      error.message.includes('CORS') ||
      error.message.includes('Failed to fetch')
    ) {
      console.error('Network/CORS error detected. Check this request URL:');
      console.error(`${API_BASE_URL}${endpoint}`);
    }
    throw error;
  }
};

export {
  apiRequest,
  getToken,
  getChatToken,
  getChatTokenFromUser,
  setToken,
  setChatToken,
  removeToken,
};
