import React from 'react';
import './WhyParkShare.css';

const WhyParkShare = () => {
  return (
    <section className="why-parkshare section">
      <div className="container">
        <h2 className="section-title text-center" style={{ color: 'white', marginBottom: '40px' }}>Why ParkShare is Important</h2>
        
        <div className="parts-container">
          <div className="part">
            <h3 className="part-title">For Renters</h3>
            <div className="cards-grid">
              <div className="info-card">
                <div className="info-icon">📍</div>
                <h4>Find Space Fast</h4>
                <p>Instantly locate open spots near your destination without circling the block.</p>
              </div>
              <div className="info-card">
                <div className="info-icon">🔒</div>
                <h4>Secure & Easy</h4>
                <p>Book and pay digitally with guaranteed access upon arrival.</p>
              </div>
            </div>
          </div>
          
          <div className="part">
            <h3 className="part-title">For Owners</h3>
            <div className="cards-grid">
              <div className="info-card">
                <div className="info-icon">💰</div>
                <h4>Earn Passively</h4>
                <p>Turn your empty driveway or assigned space into a steady stream of income.</p>
              </div>
              <div className="info-card">
                <div className="info-icon">🗓️</div>
                <h4>Total Control</h4>
                <p>Set your own schedule, availability, and pricing rules with ease.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyParkShare;
