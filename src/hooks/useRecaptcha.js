import { useCallback } from 'react';

const RECAPTCHA_SITE_KEY =
  import.meta.env.VITE_RECAPTCHA_SITE_KEY ||
  '6LeTbNwrAAAAAKacYsGjcgcakDrVu7ea5kCKTafv';

// Track if reCAPTCHA has been initialized (reload called)
let recaptchaInitialized = false;

// Helper function to wait for reCAPTCHA script to be loaded
const waitForRecaptchaScript = (maxAttempts = 50, interval = 100) => {
  return new Promise((resolve, reject) => {
    let attempts = 0;

    const checkScript = () => {
      attempts++;

      if (
        typeof window !== 'undefined' &&
        typeof window.grecaptcha !== 'undefined'
      ) {
        if (typeof window.grecaptcha.execute === 'function') {
          resolve();
          return;
        }
      }

      if (attempts >= maxAttempts) {
        reject(
          new Error('reCAPTCHA script failed to load after maximum attempts')
        );
        return;
      }

      setTimeout(checkScript, interval);
    };

    checkScript();
  });
};

const ensureRecaptchaInitialized = () => {
  return new Promise((resolve) => {
    if (recaptchaInitialized) {
      resolve();
      return;
    }

    if (typeof window.grecaptcha !== 'undefined') {
      window.grecaptcha.ready(() => {
        setTimeout(() => {
          recaptchaInitialized = true;
          resolve();
        }, 100);
      });
    } else {
      setTimeout(() => {
        ensureRecaptchaInitialized().then(resolve);
      }, 100);
    }
  });
};

export const useRecaptcha = () => {
  const getRecaptchaToken = useCallback(async (action = 'submit') => {
    // Check if site key is defined
    if (!RECAPTCHA_SITE_KEY) {
      throw new Error('reCAPTCHA site key is not configured');
    }

    try {
      await waitForRecaptchaScript();
      await ensureRecaptchaInitialized();

      return new Promise((resolve, reject) => {
        window.grecaptcha.ready(() => {
          window.grecaptcha
            .execute(RECAPTCHA_SITE_KEY, { action })
            .then((token) => {
              if (token.length < 100) {
                console.warn(
                  '⚠️ Token seems too short! Expected 100+ characters'
                );
              }
              resolve(token);
            })
            .catch((error) => {
              console.error('reCAPTCHA execution error:', error);
              reject(
                new Error(
                  `خطا در تولید کد امنیتی: ${error.message || 'خطای نامشخص'}`
                )
              );
            });
        });
      });
    } catch (error) {
      console.error('reCAPTCHA initialization error:', error);
      throw new Error('reCAPTCHA script not loaded. Please refresh the page.');
    }
  }, []);

  return { getRecaptchaToken };
};
