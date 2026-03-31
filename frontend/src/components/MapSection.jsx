import React, { useState, useEffect } from 'react';
import ListingCard from './ListingCard';
import './MapSection.css';

const MapSection = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeListing, setActiveListing] = useState(null);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8001/api/listings/');
        if (!response.ok) {
          throw new Error('Failed to fetch listings');
        }
        const data = await response.json();
        setListings(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching listings:', err);
        setError('Could not load parking spaces. Please try again later.');
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const handleListingClick = (listing) => {
    setActiveListing(listing);
    // In a real app, this would center the map on the listing or show a popup
  };

  return (
    <section className="map-section section" id="locations">
      <div className="container">
        <div className="map-header">
          <h2 className="section-title">Find Parking Near You</h2>
          
          <div className="map-filters">
            <select className="filter-select">
              <option>Any Price</option>
              <option>Under ₹50/hr</option>
              <option>₹50 - ₹100/hr</option>
            </select>
            <select className="filter-select">
              <option>Distance: 2km</option>
              <option>Distance: 5km</option>
            </select>
            <select className="filter-select">
              <option>Available Now</option>
            </select>
          </div>
        </div>

        <div className="map-layout">
          <div className="listings-sidebar">
            {loading ? (
              <div className="loading-state">Loading parking spots...</div>
            ) : error ? (
              <div className="error-state">{error}</div>
            ) : listings.length > 0 ? (
              <div className="listings-grid">
                {listings.map(listing => (
                  <ListingCard 
                    key={listing.id} 
                    listing={listing} 
                    onClick={handleListingClick}
                    isActive={activeListing?.id === listing.id}
                    onDelete={(deletedId) => {
                      setListings(prev => prev.filter(l => l.id !== deletedId));
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">No parking spots found in this area.</div>
            )}
          </div>

          <div className="map-container">
            <div className="map-placeholder">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15082.261899125345!2d72.8251!3d19.0822!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c9ce328120ab%3A0x600bca87f8b9e6!2sMumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1695420000000!5m2!1sen!2sin"
                title="ParkShare Location Map"
                width="100%"
                height="100%"
                style={{ border: 0, position: 'absolute', top: 0, left: 0, zIndex: 0, opacity: 0.6 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
              
              {activeListing && (
                <div className="map-overlay-info">
                  <div className="overlay-card">
                    <h5>{activeListing.title}</h5>
                    <p>{activeListing.location}</p>
                    <button className="btn btn-primary btn-sm">Get Directions</button>
                    <button className="btn-close" onClick={() => setActiveListing(null)}>×</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MapSection;
