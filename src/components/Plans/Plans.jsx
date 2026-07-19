import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../../hooks/useAuth';
import { useToast } from '../../contexts/ToastContext';
import { paymentService } from '../../services/paymentService';
import './Plans.css';
import { PLANS_DATA } from './constants';

const Plans = () => {
  const navigate = useNavigate();
  const { data: user } = useProfile();
  const { showToast } = useToast();
  const [loadingPlanId, setLoadingPlanId] = useState(null);

  const handlePlanClick = async (plan) => {
    if (!user) {
      showToast('لطفا ابتدا وارد حساب کاربری خود شوید', 'error');
      navigate('/login');
      return;
    }

    if (!plan.planId) {
      showToast('این پلن رایگان است', 'info');
      return;
    }

    try {
      setLoadingPlanId(plan.planId);
      const response = await paymentService.initiatePayment(plan.planId);

      if (response.success && response.payment_url) {
        // eslint-disable-next-line react-hooks/immutability
        window.location.href = response.payment_url;
      } else {
        showToast('خطا در ایجاد درخواست پرداخت', 'error');
        setLoadingPlanId(null);
      }
    } catch (error) {
      console.error('Payment initiation error:', error);
      showToast(
        error.message || 'خطا در ایجاد درخواست پرداخت. لطفا دوباره تلاش کنید.',
        'error'
      );
      setLoadingPlanId(null);
    }
  };

  return (
    <section className="plans-section">
      <div className="plans-container">
        <h2 className="plans-title">انواع حساب کاربری</h2>
        <div className="plans-grid">
          {PLANS_DATA.map((plan, index) => (
            <div
              key={plan.planId || `${plan.id}-${index}`}
              className={`plan-card ${plan.id}`}
            >
              {plan.badge && (
                <div className="plan-corner-ribbon">
                  <span className="ribbon-text">{plan.badge}</span>
                </div>
              )}

              <div className="plan-icon-container">
                <img
                  src="/icons/diamond.svg"
                  alt="Diamond"
                  className="plan-icon"
                  width={24}
                  height={24}
                />
              </div>

              <div className="plan-title-section">
                <h3 className="plan-name">{plan.name}</h3>
                {plan.subtitle && (
                  <div className="plan-subtitle-badge">
                    <span className="plan-subtitle-text">{plan.subtitle}</span>
                  </div>
                )}
              </div>

              <p className="plan-price-type">{plan.priceType}</p>

              <div className="plan-price-section">
                {plan.price === 'رایگان' ? (
                  <span className={`plan-price ${plan.id}-price`}>
                    {plan.price}
                  </span>
                ) : (
                  <div className="plan-price-split">
                    <span className="plan-price-number">
                      {plan.price.match(
                        /[\d\u06F0-\u06F9\u0660-\u0669]+/
                      )?.[0] || ''}
                    </span>
                    <span className="plan-price-text">
                      {plan.price
                        .replace(/[\d\u06F0-\u06F9\u0660-\u0669]+/, '')
                        .trim()}
                    </span>
                  </div>
                )}
                {plan.discount && (
                  <span
                    className={`plan-price-discount ${plan.id}-price-discount`}
                  >
                    {plan.discount}
                  </span>
                )}
                <div className="plan-price-border"></div>
              </div>

              <ul className="plan-features">
                {plan.features.map((feature, index) => {
                  const featureData =
                    typeof feature === 'object' ? feature : { text: feature };
                  const iconType = featureData.icon || 'bullet';
                  return (
                    <li key={index} className="plan-feature">
                      <img
                        src={`/icons/${iconType}.svg`}
                        alt={iconType === 'lock' ? 'Locked' : 'Available'}
                        className={`plan-feature-icon ${
                          iconType === 'lock' ? 'plan-feature-icon-lock' : ''
                        }`}
                      />
                      <span className="plan-feature-text">
                        {featureData.text || feature}
                      </span>
                    </li>
                  );
                })}
              </ul>

              <div className="plan-request-count">
                تعداد درخواست ها {plan.requestCount}
              </div>

              {plan.description && (
                <p className="plan-description">{plan.description}</p>
              )}

              <div className="plan-bottom-price-section">
                {plan.id === 'normal' ? (
                  <span className="plan-free-price">{plan.bottomPrice}</span>
                ) : (
                  <div className="plan-price-details">
                    <div className="plan-price-details-left">
                      <span className="plan-discount-percent">
                        {plan.bottomDiscount
                          ?.replace('تخفیف ویژه', '')
                          .replace('تخفیف', '')
                          .trim()}
                      </span>
                      <span className="plan-discount-text">تخفیف</span>
                    </div>
                    <div className="plan-price-details-right">
                      <div className="plan-original-price-row">
                        <span className="plan-original-price">
                          {plan.originalPrice}
                        </span>
                        <span className="plan-original-price-label">تومان</span>
                      </div>
                      <span className="plan-final-price">
                        {plan.bottomPrice}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <button
                className={`plan-upgrade-btn ${
                  plan.id === 'normal' ? 'ghost' : 'fill'
                }`}
                onClick={() => handlePlanClick(plan)}
                disabled={loadingPlanId === plan.planId}
              >
                {loadingPlanId === plan.planId
                  ? 'در حال انتقال...'
                  : plan.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Plans;
