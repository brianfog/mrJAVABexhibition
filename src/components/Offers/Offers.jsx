import { useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useOffers } from '../../hooks/useChat';
import './Offers.css';

const Offers = () => {
  const location = useLocation();
  const { data: offersData, isLoading, error } = useOffers();
  const sectionRef = useRef(null);
  const [paddingTop, setPaddingTop] = useState(85); // Base padding-top

  // Listen to chat input height changes and adjust padding
  useEffect(() => {
    const handleHeightChange = (event) => {
      const { heightDifference } = event.detail;
      // Base padding is 85px, add the height difference to maintain spacing
      setPaddingTop(85 + heightDifference);
    };

    window.addEventListener('chatInputHeightChange', handleHeightChange);

    return () => {
      window.removeEventListener('chatInputHeightChange', handleHeightChange);
    };
  }, []);

  // Apply dynamic padding
  useEffect(() => {
    if (sectionRef.current) {
      sectionRef.current.style.paddingTop = `${paddingTop}px`;
    }
  }, [paddingTop]);

  const getSidebarItemName = (pathname) => {
    const pathMap = {
      '/': 'حل مسائل',
      '/problem-solver': 'حل مسائل',
      '/pdf-helper': 'همیار مقاله/ PDF', // Note: no space before / in API response
      '/quiz-maker': 'طراحی نمونه سوال',
      '/book-chat': 'چت با کتاب',
      '/summarizer': 'خلاصه سازی',
    };
    return pathMap[pathname] || 'حل مسائل';
  };

  // Map sidebar item name to category name (handles variations)
  const getCategoryName = (sidebarItemName) => {
    const categoryMap = {
      'حل مسائل': 'حل مسئله', // API uses "حل مسئله" but sidebar shows "حل مسائل"
      'همیار مقاله / PDF': 'همیار مقاله/ PDF', // Handle space difference
      'همیار مقاله/ PDF': 'همیار مقاله/ PDF',
      'طراحی نمونه سوال': 'طراحی نمونه سوال',
      'چت با کتاب': 'چت با کتاب',
      'خلاصه سازی': 'خلاصه سازی',
    };
    return categoryMap[sidebarItemName] || sidebarItemName;
  };

  const getFilteredOffers = () => {
    if (!offersData || !Array.isArray(offersData)) return [];

    const sidebarItemName = getSidebarItemName(location.pathname);

    const groupedOffers = offersData.reduce((groups, offer) => {
      let categories = [];
      try {
        if (offer.categories) {
          categories =
            typeof offer.categories === 'string'
              ? JSON.parse(offer.categories)
              : offer.categories;
        }
      } catch (error) {
        console.error('Error parsing categories:', error);
        return groups;
      }

      const groupKey =
        Array.isArray(categories) && categories.length > 1
          ? categories[1]
          : 'other';

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }

      groups[groupKey].push(offer);

      return groups;
    }, {});

    const categoryName = getCategoryName(sidebarItemName);

    const matchingGroup = groupedOffers[categoryName] || [];
    return matchingGroup;
  };

  const filteredOffers = getFilteredOffers();

  const handleOfferClick = (offer) => {
    // Store offer value in localStorage
    localStorage.setItem('pendingOfferValue', offer.value);

    // Dispatch custom event to notify ChatInput
    window.dispatchEvent(
      new CustomEvent('offerSelected', {
        detail: { value: offer.value },
      })
    );

    // Scroll to chat input and focus it
    setTimeout(() => {
      const chatInput = document.querySelector('.chat-input-textarea');
      if (chatInput) {
        chatInput.focus();
        chatInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  if (isLoading) {
    return (
      <section ref={sectionRef} className="offers-section">
        <div className="container">
          <div className="offers-loading">در حال بارگذاری...</div>
        </div>
      </section>
    );
  }

  if (error) {
    return null; // Don't show error, just don't render offers
  }

  if (!filteredOffers || filteredOffers.length === 0) {
    return null; // Don't render if no offers
  }

  return (
    <section ref={sectionRef} className="offers-section">
      <div className="container">
        <div className="offers-container">
          <h2 className="offers-title">سوالات پیشنهادی:</h2>
          <div className="offers-list">
            {filteredOffers.map((offer, index) => (
              <div
                key={offer.id || index}
                className="offer-item"
                onClick={() => handleOfferClick(offer)}
              >
                {offer.value}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Offers;
