import { useEffect, useRef } from 'react';

/**
 * Custom hook to detect clicks outside of specified elements
 * @param {Object} options - Configuration options
 * @param {Array<React.RefObject|HTMLElement|string>} options.refs - Array of refs, elements, or CSS selectors to check
 * @param {Function} options.handler - Callback function to execute when click is outside
 * @param {boolean} options.enabled - Whether the hook is enabled (default: true)
 * @param {string} options.eventType - Event type to listen to (default: 'mousedown')
 */
export const useClickOutside = ({
  refs = [],
  handler,
  enabled = true,
  eventType = 'mousedown',
}) => {
  const handlerRef = useRef(handler);
  const refsRef = useRef(refs);

  // Keep refs and handler up to date
  useEffect(() => {
    handlerRef.current = handler;
    refsRef.current = refs;
  }, [handler, refs]);

  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event) => {
      // Check if click is outside all provided refs/elements
      const isOutside = refsRef.current.every((ref) => {
        if (!ref) return true;

        let element = null;

        // Handle different ref types
        if (typeof ref === 'string') {
          // CSS selector string - check if target matches selector or is inside element matching selector
          const matchedElement = document.querySelector(ref);
          if (matchedElement) {
            // Check if click is outside the matched element
            // Also check if target itself matches the selector
            return (
              !matchedElement.contains(event.target) &&
              !event.target.closest(ref)
            );
          }
          return true;
        } else if (ref.current) {
          // React ref object
          element = ref.current;
        } else if (ref instanceof HTMLElement) {
          // Direct HTMLElement
          element = ref;
        }

        if (!element) return true;

        // Check if click target is inside the element
        return !element.contains(event.target);
      });

      if (isOutside) {
        handlerRef.current(event);
      }
    };

    document.addEventListener(eventType, handleClickOutside);

    return () => {
      document.removeEventListener(eventType, handleClickOutside);
    };
  }, [enabled, eventType]);
};
