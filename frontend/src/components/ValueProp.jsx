import React from 'react';
import './ValueProp.css';

const ValueProp = () => {
  return (
    <section className="value-prop section">
      <div className="container">
        <div className="value-prop-header text-center">
          <h2 className="section-title">Why Choose ParkShare?</h2>
          <p className="subtitle">The smartest way to find and list parking spaces.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">⏱️</div>
            <h3>Real-Time Availability</h3>
            <p>See exactly what's open right now. No more circling the block hoping for a spot.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure Bookings</h3>
            <p>Safe and encrypted payments with automatic refunds if you need to cancel early.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <h3>Flexible Pricing</h3>
            <p>Owners set their own rates. Renters filter by budget to find the best deals.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⭐</div>
            <h3>Verified Users</h3>
            <p>All renters and owners are verified to ensure a safe, reliable community.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValueProp;
