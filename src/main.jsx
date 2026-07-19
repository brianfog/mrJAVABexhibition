import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.jsx';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';

const initializeRecaptcha = () => {
  let attemptCount = 0;
  const maxAttempts = 100; // 10 seconds total

  const checkAndInit = () => {
    attemptCount++;

    const scriptTag = document.querySelector('script[src*="recaptcha/api.js"]');
    if (!scriptTag) {
      if (attemptCount >= maxAttempts) {
        return;
      }
      setTimeout(checkAndInit, 100);
      return;
    }

    if (window.__recaptchaScriptError) {
      return;
    }

    if (
      typeof window !== 'undefined' &&
      typeof window.grecaptcha !== 'undefined'
    ) {
      try {
        window.grecaptcha.ready(() => {});
      } catch (error) {
        console.error('❌ Error calling grecaptcha.ready():', error);
      }
    } else {
      if (attemptCount < maxAttempts) {
        setTimeout(checkAndInit, 100);
      } else {
        console.error(
          '❌ window.grecaptcha not available after',
          maxAttempts,
          'attempts (10 seconds)'
        );
        console.error('Script loaded flag:', window.__recaptchaScriptLoaded);
        console.error('Please check:');
        console.error('  1. Is the script tag in index.html?');
        console.error('  2. Is there a network error loading the script?');
        console.error('  3. Check Network tab for api.js request');
      }
    }
  };

  checkAndInit();
};

initializeRecaptcha();
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>
);
