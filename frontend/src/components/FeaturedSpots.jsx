import React from 'react';
import './FeaturedSpots.css';

const SPOTS = [
  {
    id: 1,
    title: 'Downtown Secure Garage',
    type: 'Covered Garage',
    distance: '0.2 miles away',
    price: '₹50/hr',
    image: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&q=80&w=800',
    available: true
  },
  {
    id: 2,
    title: 'Sunny Ave Driveway',
    type: 'Private Driveway',
    distance: '0.5 miles away',
    price: '₹30/hr',
    image: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&q=80&w=800',
    available: true
  },
  {
    id: 3,
    title: 'Central Station Lot',
    type: 'Open Lot',
    distance: '1.2 miles away',
    price: '₹80/hr',
    image: 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&q=80&w=800',
    available: false
  }
];

const FeaturedSpots = () => {
  return (
    <section className="featured-spots section bg-light" id="locations">
      <div className="container">
        <div className="section-header text-center">
          <h2 className="section-title">Popular Spots Near You</h2>
          <p className="section-subtitle">Find and book the highest-rated parking spaces in your area instantly.</p>
        </div>

        <div className="spots-grid">
          {SPOTS.map(spot => (
            <div className="spot-card" key={spot.id}>
              <div className="spot-img-wrapper">
                <img src={spot.image} alt={spot.title} className="spot-img" />
                <div className={`spot-badge ${spot.available ? 'available' : 'taken'}`}>
                  {spot.available ? 'Available Now' : 'Currently Taken'}
                </div>
              </div>
              <div className="spot-info">
                <div className="spot-header">
                  <h3 className="spot-title">{spot.title}</h3>
                  <div className="spot-price">{spot.price}</div>
                </div>
                <div className="spot-details">
                  <span className="spot-type">{spot.type}</span>
                  <span className="spot-distance">{spot.distance}</span>
                </div>
                <button 
                  className={`btn w-100 ${spot.available ? 'btn-primary' : 'btn-secondary'}`}
                  disabled={!spot.available}
                  style={{ marginTop: '1rem' }}
                >
                  {spot.available ? 'Book This Spot' : 'Join Waitlist'}
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center" style={{ marginTop: '3rem' }}>
          <button className="btn btn-secondary">View All Locations</button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedSpots;
