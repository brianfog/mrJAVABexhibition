import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { paymentService } from '../services/paymentService';
import { useToast } from '../contexts/ToastContext';
import { useProfile } from '../hooks/useAuth';
import './PaymentResult.css';
import Hero from '../components/Hero/Hero';

const PaymentResult = () => {
  const { status } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const { data: user } = useProfile();
  const [isVerifying, setIsVerifying] = useState(false);
  const [paymentData, setPaymentData] = useState(null);

  // Check if this is a callback from Zarinpal
  const orderId = searchParams.get('order');
  const authority = searchParams.get('Authority');
  const zarinpalStatus = searchParams.get('Status');

  // Verify payment if callback params exist
  useEffect(() => {
    const verifyPayment = async () => {
      if (!orderId || !authority || !zarinpalStatus) {
        return;
      }

      setIsVerifying(true);

      try {
        const response = await paymentService.verifyPayment(
          orderId,
          authority,
          zarinpalStatus
        );

        if (response.success) {
          setPaymentData({
            orderId: response.order_id,
            credit: response.credit,
            message: response.message,
          });

          if (response.token) {
            localStorage.setItem('chat_token', response.token);
          }
          showToast(response.message || 'پرداخت با موفقیت انجام شد', 'success');

          navigate(`/payment/success?tracking=${response.order_id}`, {
            replace: true,
          });
        } else {
          setPaymentData({
            orderId: orderId,
            message: response.message || 'پرداخت لغو شد یا ناموفق بود',
          });

          showToast(response.message || 'پرداخت لغو شد یا ناموفق بود', 'error');

          navigate(`/payment/failed?tracking=${orderId}`, { replace: true });
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setPaymentData({
          orderId: orderId,
          message: error.message || 'خطا در بررسی وضعیت پرداخت',
        });
        showToast('خطا در بررسی وضعیت پرداخت', 'error');
        navigate(`/payment/failed?tracking=${orderId}`, { replace: true });
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [orderId, authority, zarinpalStatus, navigate, showToast]);

  const isSuccess = status === 'success';
  const isFailed = status === 'failed';

  const trackingNumber = paymentData?.orderId || searchParams.get('tracking');

  const handleRetry = () => {
    navigate('/plans');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  // Show loading state while verifying payment
  if (isVerifying) {
    return (
      <>
        <Hero hideChatInput={true} />
        <div className="payment-result-page">
          <div className="container">
            <div className="payment-result-content">
              <div className="payment-result-text-column">
                <h1 className="payment-result-title">در حال بررسی پرداخت...</h1>
                <p className="payment-result-message">
                  لطفا صبر کنید، در حال بررسی وضعیت پرداخت شما هستیم.
                </p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // If callback params exist but verification not complete, wait
  if (orderId && authority && zarinpalStatus && !paymentData) {
    return null;
  }

  // If no status param and no callback params, redirect to home
  if (!isSuccess && !isFailed && !orderId) {
    navigate('/');
    return null;
  }

  return (
    <>
      <Hero hideChatInput={true} />
      <div className="payment-result-page">
        <div className="container">
          <div className="payment-result-content">
            <div className="payment-result-text-column">
              {isFailed ? (
                <>
                  <h1 className="payment-result-title failed">
                    پرداخت شما انجام نشد!
                  </h1>
                  <p className="payment-result-message failed">
                    {user?.name || 'کاربر'} عزیز این پیام به منزله تایید نشدن
                    خرید شماست
                    <br />
                    {paymentData?.message && (
                      <>
                        {paymentData.message}
                        <br />
                      </>
                    )}
                    در صورت کسر هزینه از حساب شما، مبلغ پرداختی تا ۷۲ ساعت
                    <br />
                    آینده به حساب شما برخواهدگشت.
                  </p>
                  <p className="payment-result-tracking failed">
                    شماره پیگیری پرداخت: {trackingNumber}
                  </p>
                  <div className="payment-result-buttons">
                    <button
                      className="payment-result-button primary"
                      onClick={handleRetry}
                    >
                      <img
                        src="/icons/repeat-circle.svg"
                        alt=""
                        className="button-icon"
                      />
                      تلاش دوباره
                    </button>
                    <button
                      className="payment-result-button outline"
                      onClick={handleGoHome}
                    >
                      صفحه اصلی
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h1 className="payment-result-title success">
                    سفارش شما با موفقیت انجام شد 🥳
                  </h1>
                  <p className="payment-result-message success">
                    {user?.name || 'کاربر'} عزیز سفارش شما انجام شد
                    <br />
                    {paymentData?.credit && (
                      <>
                        اعتبار شما: {paymentData.credit} درخواست
                        <br />
                      </>
                    )}
                    در تاریخ معین شده سفارش شما ثبت شد.
                  </p>
                  <p className="payment-result-tracking success">
                    کد رهگیری سفارش: {trackingNumber}
                  </p>
                  <div className="payment-result-buttons">
                    <button
                      className="payment-result-button primary"
                      onClick={handleGoHome}
                    >
                      صفحه اصلی
                    </button>
                    <button
                      className="payment-result-button outline"
                      onClick={handleRetry}
                    >
                      <img
                        src="/icons/receipt-text.svg"
                        alt=""
                        className="button-icon"
                      />
                      مشاهده پلن‌ها
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="payment-result-image-column">
              <img
                src={`/images/${isSuccess ? 'success' : 'failed'}.png`}
                alt={isSuccess ? 'Success' : 'Failed'}
                className="payment-result-image desktop-image"
              />
              <img
                src={
                  isSuccess
                    ? '/images/success-check.png'
                    : '/images/failed-check.svg'
                }
                alt={isSuccess ? 'Success' : 'Failed'}
                className="payment-result-image mobile-image"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentResult;
