import React from 'react';
import './Footer.css';

const Footer = () => {
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
              <a href="#earn">List Space</a>
              <a href="#">Pricing</a>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <a href="#">About Us</a>
              <a href="#">Careers</a>
              <a href="#">Contact</a>
              <a href="#">Blog</a>
            </div>
            <div className="footer-col">
              <h4>Legal</h4>
              <a href="#">Terms of Service</a>
              <a href="#">Privacy Policy</a>
              <a href="#">Trust & Safety</a>
            </div>
          </div>
        </div>
        <div className="container text-center footer-bottom">
          <p>&copy; 2026 ParkShare. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
};

export default Footer;
