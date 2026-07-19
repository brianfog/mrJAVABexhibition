import './MobileHeader.css';
import { useNavigate } from 'react-router-dom';
const MobileHeader = ({ onMenuClick }) => {
  const navigate = useNavigate();

  return (
    <header className="mobile-header">
      <button
        className="hamburger-menu"
        id="hamburgerMenu"
        onClick={onMenuClick}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
      <div className="mobile-logo" onClick={() => navigate('/')}>
        <div className="mobile-logo-image-container">
          <img src="/images/logo.webp" alt="MRJAVAB" className="hero-image" />
        </div>
        <span>MRJAVAB</span>
      </div>
    </header>
  );
};

export default MobileHeader;
