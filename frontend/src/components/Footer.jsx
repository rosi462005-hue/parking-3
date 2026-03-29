import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [legalModalContent, setLegalModalContent] = useState(null); // 'terms' | 'privacy'

  const handleAboutClick = (e) => {
    e.preventDefault(); // Ensure no page refresh occurs on click
    setShowAboutModal(true);
  };

  const closeAboutModal = () => {
    setShowAboutModal(false);
  };

  const openLegalModal = (e, type) => {
    e.preventDefault();
    setLegalModalContent(type);
  }

  return (
    <>
      <footer className="main-footer section">
        <div className="container footer-container">
          <div className="footer-brand">
            <div className="logo footer-logo">
              Park<span>Share</span>
            </div>
            <p className="footer-description">
              The smartest way to park or earn from your unused space.
            </p>
          </div>

          <div className="footer-links">
            <div className="footer-col">
              <h4>Product</h4>
              <a href="#how-it-works">How it Works</a>
              {/* FIX: Ensure List Space redirects to the listing page */}
              <Link to="/list">List Space</Link>
              {/* FIX: Removing Pricing from UI only */}
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <a href="#" onClick={handleAboutClick}>About Us</a>
              {/* FIX: Removing Careers, Contact, and Blog from UI only */}
            </div>
            <div className="footer-col">
              <h4>Legal</h4>
              <a href="#" onClick={(e) => openLegalModal(e, 'terms')}>Terms of Service</a>
              <a href="#" onClick={(e) => openLegalModal(e, 'privacy')}>Privacy Policy</a>
              {/* FIX: Removing Trust & Safety from UI only */}
            </div>
          </div>
        </div>
        <div className="container text-center footer-bottom">
          <p>&copy; 2026 ParkShare. All rights reserved.</p>
        </div>
      </footer>

      {/* About Us Modal Implementation */}
      {showAboutModal && (
        <div 
          onClick={closeAboutModal} 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            style={{
              backgroundColor: '#fff',
              color: '#333',
              padding: '2rem',
              borderRadius: '12px',
              maxWidth: '500px',
              width: '90%',
              position: 'relative',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              textAlign: 'left'
            }}
          >
            <button 
              onClick={closeAboutModal}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'transparent',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#666',
                padding: '0 5px'
              }}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 style={{ marginTop: 0, marginBottom: '1rem', color: '#1a1a1a', fontSize: '1.5rem' }}>About Us</h2>
            <p style={{ lineHeight: '1.6', margin: 0, fontSize: '1rem', color: '#4a4a4a' }}>
              ParkShare is a smart parking platform that connects people who have unused parking spaces with those looking for convenient and affordable parking nearby. We make parking easier, faster, and more efficient for everyone. Our platform enables users to discover parking spaces in real-time, book them seamlessly, and navigate to the location with ease, while helping space owners earn from their idle assets. By leveraging technology, we aim to reduce parking congestion and create a smarter, more sustainable urban mobility experience.
            </p>
          </div>
        </div>
      )}

      {/* Legal Modal Implementation */}
      {legalModalContent && (
        <div 
          onClick={() => setLegalModalContent(null)} 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            style={{
              backgroundColor: '#fff',
              color: '#333',
              padding: '2rem',
              borderRadius: '12px',
              maxWidth: '500px',
              width: '90%',
              position: 'relative',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              textAlign: 'left',
              maxHeight: '90vh', // Prevent cut-off on small screens
              overflowY: 'auto'
            }}
          >
            <button 
              onClick={() => setLegalModalContent(null)}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'transparent',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#666',
                padding: '0 5px'
              }}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 style={{ marginTop: 0, marginBottom: '1rem', color: '#1a1a1a', fontSize: '1.5rem' }}>
              {legalModalContent === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
            </h2>
            <p style={{ lineHeight: '1.6', margin: 0, fontSize: '1rem', color: '#4a4a4a', whiteSpace: 'pre-wrap' }}>
              {legalModalContent === 'privacy' 
                ? "ParkShare values your privacy. We collect basic user information such as name, email, and location to provide a better parking experience. This data is used to enable bookings, improve services, and enhance user experience.\n\nWe do not sell or share your personal information with third parties except when required for essential services or legal obligations.\n\nBy using ParkShare, you agree to the collection and use of information in accordance with this policy."
                : "By using ParkShare, you agree to use the platform responsibly. Users can list and book parking spaces at their own discretion.\n\nParkShare acts as a platform connecting space owners and users and is not responsible for disputes, damages, or misuse of parking spaces.\n\nWe reserve the right to modify or remove listings that violate our guidelines."
              }
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;
