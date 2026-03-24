import React from 'react';
import './EarnSection.css';

const EarnSection = () => {
  return (
    <section className="earn-section section" id="earn">
      <div className="container earn-container">
        <div className="earn-content">
          <h2 className="section-title">Turn Your Empty Space Into Income</h2>
          <p className="earn-subtitle">
            Whether it's a driveway, a commercial spot, or an unused garage, your space could be earning you money right now.
          </p>
          
          <div className="earnings-calculator">
            <h3>Estimated Earning Potential</h3>
            <div className="earnings-stats">
              <div className="stat">
                <span className="stat-value">$300</span>
                <span className="stat-label">per week</span>
              </div>
              <div className="stat">
                <span className="stat-value">$1,200</span>
                <span className="stat-label">per month</span>
              </div>
            </div>
            <p className="earnings-note">*Based on average prime location daily rentals.</p>
          </div>
          
          <button className="btn btn-primary earn-cta">Start Earning Today</button>
        </div>
        
        <div className="earn-visual">
          <div className="earnings-mockup">
            <div className="mockup-card balance-card">
              <div className="card-header">Current Balance</div>
              <div className="card-balance">$850.00</div>
              <div className="card-trend text-accent">+15% this week</div>
            </div>
            
            <div className="mockup-card booking-card">
              <div className="booking-info">
                <strong>New Booking Confirmed</strong>
                <span>Downtown Garage • Tomorrow, 9 AM - 5 PM</span>
              </div>
              <div className="booking-price">+$40</div>
            </div>
            
            <div className="mockup-card booking-card">
              <div className="booking-info">
                <strong>Payout Processed</strong>
                <span>Bank Ending in 1234</span>
              </div>
              <div className="booking-price payout">-$500</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EarnSection;
