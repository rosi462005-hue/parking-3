import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import ListingCard from '../components/ListingCard';
import BookingModal from '../components/BookingModal';
import '../components/ParkingSearch.css';

const ResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { listings, userLocation } = location.state || { listings: [], userLocation: null };
  const [selectedListing, setSelectedListing] = useState(null);

  if (!userLocation) {
    return (
      <section className="parking-search-section section" style={{paddingTop: '100px', minHeight: 'calc(100vh - 100px)', textAlign: 'center'}}>
        <div className="container">
          <h2>No search active</h2>
          <button className="btn btn-primary" onClick={() => navigate('/search')}>Go Back to Search</button>
        </div>
      </section>
    );
  }

  return (
    <section className="parking-search-section section" style={{paddingTop: '100px', minHeight: 'calc(100vh - 100px)'}}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <h2 className="section-title" style={{margin: 0}}>Available Parking Slots</h2>
          <button className="btn btn-secondary" onClick={() => navigate('/search')}>Back</button>
        </div>

        <div className="results-container">
          {listings.length === 0 && (
            <div className="status-message warning">No spaces found in your area.</div>
          )}

          {listings.length > 0 && (
            <div className="listings-grid">
              {listings.map(listing => (
                <div key={listing.id} className="listing-result-wrapper">
                  <ListingCard listing={listing} onClick={(l) => setSelectedListing(l)} />
                  <div className="distance-badge">
                    {listing.distance.toFixed(1)} km away
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedListing && (
        <BookingModal
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
          onConfirm={() => setSelectedListing(null)}
        />
      )}
    </section>
  );
};

export default ResultsPage;
