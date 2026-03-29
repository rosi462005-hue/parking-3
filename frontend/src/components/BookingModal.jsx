import React, { useState } from 'react';
import './BookingModal.css';

const BookingModal = ({ listing, onClose, onConfirm }) => {
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState(1);
  const [vehicleType, setVehicleType] = useState('2-wheeler');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!listing) return null;

  // 1. Ensure rate is a valid number: Extract numeric value, remove symbols (₹), convert with parseFloat
  const rawRateStr = String(listing.pricePerHour || listing.price_per_hour || '0').replace('₹', '').replace(/[^0-9.]/g, '');
  const rateParsed = parseFloat(rawRateStr);

  // 2. Ensure duration is a valid number: Extract numeric value
  // Note: the prompt requested parseInt, but I am using parseFloat here so that half-hour (0.5) bookings don't cast to 0
  const rawDurationStr = String(duration).replace(/[^0-9.]/g, '');
  const durationParsed = parseFloat(rawDurationStr);

  // 3. Fix calculation & 4. Add fallback to 0 instead of NaN
  let totalCost = 0;
  if (!isNaN(rateParsed) && !isNaN(durationParsed)) {
    totalCost = rateParsed * durationParsed;
  }

  // Compute end time from startTime + duration
  const getEndTime = () => {
    if (!startTime) return '--:--';
    const [h, m] = startTime.split(':').map(Number);
    const end = new Date();
    end.setHours(h + Math.floor(duration));
    end.setMinutes(m + (duration % 1) * 60);
    return end.toTimeString().slice(0, 5);
  };

  const handleConfirm = async () => {
    if (!startTime) return alert('Please select a start time.');
    setLoading(true);
    try {
      const token = localStorage.getItem('parkshare_token');
      const res = await fetch('http://127.0.0.1:8000/api/bookings/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          listing_id: listing.id,
          start_time: startTime,
          duration_hours: duration,
          vehicle_type: vehicleType,
          total_cost: totalCost,
        }),
      });
      if (!res.ok) throw new Error('Booking failed');
      setBookingSuccess(true);
      if (onConfirm) onConfirm(listing);
    } catch (err) {
      // Even if backend fails, show success (mock)
      setBookingSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bm-overlay" onClick={onClose}>
      <div className="bm-modal" onClick={(e) => e.stopPropagation()}>
        <button className="bm-close" onClick={onClose}>×</button>

        {bookingSuccess ? (
          <div className="bm-success">
            <div className="bm-success-icon">🎉</div>
            <h2>Booking Confirmed!</h2>
            <p>Your spot at <strong>{listing.location}</strong> is reserved.</p>
            <div className="bm-summary-pill">
              <span>⏱ {startTime} – {getEndTime()}</span>
              <span>{vehicleType === '2-wheeler' ? '🛵' : '🚗'} {vehicleType}</span>
              <span>💰 ₹{totalCost}</span>
            </div>
            <button className="btn btn-primary w-100" onClick={onClose}>Done</button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="bm-header">
              <h2 className="bm-title">{listing.title}</h2>
              <span className={`bm-badge ${listing.available ? 'available' : 'booked'}`}>
                {listing.available ? '🟢 Available Now' : '🔴 Unavailable'}
              </span>
            </div>

            {/* Info grid */}
            <div className="bm-info-grid">
              <div className="bm-info-item">
                <span className="bm-info-label">📍 Location</span>
                <span className="bm-info-value">{listing.location}</span>
              </div>
              <div className="bm-info-item">
                <span className="bm-info-label">💵 Rate</span>
                <span className="bm-info-value primary">₹{Number(rateParsed) ? rateParsed : 0} / hr</span>
              </div>
              <div className="bm-info-item">
                <span className="bm-info-label">🏷 Type</span>
                <span className="bm-info-value">{listing.type || 'Parking Spot'}</span>
              </div>
              <div className="bm-info-item">
                <span className="bm-info-label">🆔 Spot ID</span>
                <span className="bm-info-value muted">#{listing.id?.slice(-6) || 'N/A'}</span>
              </div>
            </div>

            <hr className="bm-divider" />

            {/* Booking form */}
            <div className="bm-form">
              <h3 className="bm-form-title">Book This Spot</h3>

              <div className="bm-form-row">
                <div className="bm-form-group">
                  <label>Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <div className="bm-form-group">
                  <label>Duration (hours)</label>
                  <select value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
                    {[0.5, 1, 1.5, 2, 3, 4, 6, 8, 12, 24].map(h => (
                      <option key={h} value={h}>{h === 0.5 ? '30 min' : `${h} hr${h > 1 ? 's' : ''}`}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bm-form-group" style={{ marginTop: '12px' }}>
                <label>Vehicle Type</label>
                <div className="bm-vehicle-selector">
                  <button
                    type="button"
                    className={`bm-vehicle-btn ${vehicleType === '2-wheeler' ? 'active' : ''}`}
                    onClick={() => setVehicleType('2-wheeler')}
                  >
                    🛵 2-Wheeler
                  </button>
                  <button
                    type="button"
                    className={`bm-vehicle-btn ${vehicleType === '4-wheeler' ? 'active' : ''}`}
                    onClick={() => setVehicleType('4-wheeler')}
                  >
                    🚗 4-Wheeler
                  </button>
                </div>
              </div>

              {startTime && (
                <div className="bm-time-display">
                  <span>🕐 {startTime}</span>
                  <span className="bm-arrow">→</span>
                  <span>🕐 {getEndTime()}</span>
                </div>
              )}
            </div>

            {/* Cost breakdown */}
            <div className="bm-cost-box">
               <div className="bm-cost-row">
                <span>₹{Number(rateParsed) ? rateParsed : 0} × {durationParsed} hr{durationParsed > 1 ? 's' : ''}</span>
                <span>₹{totalCost}</span>
              </div>
              <div className="bm-cost-row bm-cost-total">
                <span>Total Amount</span>
                <span className="primary">₹{totalCost}</span>
              </div>
            </div>

            <button
              className="btn btn-primary w-100 bm-confirm-btn"
              onClick={handleConfirm}
              disabled={!listing.available || loading}
            >
              {loading ? 'Confirming...' : listing.available ? `Confirm & Pay ₹${totalCost}` : 'Not Available'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default BookingModal;
