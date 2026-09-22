import { useNavigate } from 'react-router-dom';
import Modal from '../Modal/Modal';
import './AccountModal.css';

const AccountModal = ({ isOpen, onClose, onNavigateToPlans, VIPModal}) => {
  const navigate = useNavigate();

  const handleAccountTypes = () => {
    // Notify parent that we're navigating to plans
    if (onNavigateToPlans) {
      onNavigateToPlans();
    }
    // Close modal and navigate
    onClose();
    VIPModal ? navigate('/vip') : navigate('/plans');
  };

  const VIPObj = {

    title : 'تهیه اشتراک VIP',
    description : 'برای دسترسی به قابلیت های VIP کلیک کنید',
    button : 'خرید اشتراک VIP'    

  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="small">
      <div className="account-modal-content">
        <div className="account-modal-image-container">
          <img
            src="/images/logo.webp"
            alt="MRJAVAB"
            className="account-modal-image"
          />
        </div>

        <h2 className="account-modal-title" style={{color: VIPModal ? '#e80000' : '#0260eb' }}>{VIPModal ? VIPObj.title : 'تهیه حساب کاربری'}</h2>

        <p className="account-modal-description">
          { VIPModal ? VIPObj.description : 'پس از تایید می توانید به حساب کاربری خود دسترسی پیدا کنید'}
        </p>

        <button className="account-modal-button" style={{background : VIPModal ? '#e80000' : '#0260eb'}} onClick={handleAccountTypes}>
          { VIPModal ? VIPObj.button : 'انواع حساب های کاربری'}
          <img
            src="/icons/arrow-circle-left.svg"
            alt=""
            className="button-icon"
          />
        </button>
      </div>
    </Modal>
  );
};

export default AccountModal;
