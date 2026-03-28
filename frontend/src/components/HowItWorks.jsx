import React, { useState } from 'react';
import './HowItWorks.css';

const HowItWorks = () => {
  const [activeTab, setActiveTab] = useState('renter');

  return (
    <section className="how-it-works section" id="how-it-works">
      <div className="container">
        <h2 className="section-title text-center">How It Works</h2>

        <div className="tab-container">
          <button 
            className={`tab-btn ${activeTab === 'renter' ? 'active' : ''}`}
            onClick={() => setActiveTab('renter')}
          >
            For Drivers
          </button>
          <button 
            className={`tab-btn ${activeTab === 'owner' ? 'active' : ''}`}
            onClick={() => setActiveTab('owner')}
          >
            For Space Owners
          </button>
        </div>

        <div className="steps-container">
          {activeTab === 'renter' ? (
            <div className="steps-row fade-in">
              <div className="step-card">
                <div className="step-icon">🔍</div>
                <h3>1. Search Location</h3>
                <p>Enter your destination and find nearby available parking spots in real-time.</p>
              </div>
              <div className="step-card">
                <div className="step-icon">⚖️</div>
                <h3>2. Compare Spaces</h3>
                <p>Filter by price, distance, and amenities to find the perfect spot.</p>
              </div>
              <div className="step-card">
                <div className="step-icon">⚡</div>
                <h3>3. Book Instantly</h3>
                <p>Reserve and pay securely on arrival. Just drive in and park.</p>
              </div>
            </div>
          ) : (
            <div className="steps-row fade-in">
              <div className="step-card">
                <div className="step-icon">📍</div>
                <h3>1. List Your Space</h3>
                <p>Add photos, set availability, and define your price in under 5 minutes.</p>
              </div>
              <div className="step-card">
                <div className="step-icon">🔔</div>
                <h3>2. Accept Bookings</h3>
                <p>Get notified when someone books your space. You're fully protected.</p>
              </div>
              <div className="step-card">
                <div className="step-icon">💰</div>
                <h3>3. Earn Money</h3>
                <p>Receive your payouts directly to your bank account automatically.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
