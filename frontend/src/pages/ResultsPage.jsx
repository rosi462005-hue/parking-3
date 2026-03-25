import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ListingCard from '../components/ListingCard';
import BookingModal from '../components/BookingModal';
import '../components/ParkingSearch.css';

const ResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedListing, setSelectedListing] = useState(null);

  const listings = location.state?.listings || [];
  const userLocation = location.state?.userLocation || null;

  return (
    <section className="parking-search-section section" style={{paddingTop: '100px', minHeight: 'calc(100vh - 100px)'}}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <h2 className="section-title" style={{margin: 0}}>Nearest Parking Slots</h2>
          <button className="btn btn-secondary" onClick={() => navigate('/search')}>Go Back</button>
        </div>

        <div className="results-container">
          {listings.length === 0 && (
            <div className="status-message warning">
               No spaces sorted. Please ensure Geolocation is active!
               <br/><br/>
               <button className="btn btn-primary" onClick={() => navigate('/search')}>Try Again</button>
            </div>
          )}

          {listings.length > 0 && (
            <div className="listings-grid">
              {listings.map(listing => (
                <div key={listing.id} className="listing-result-wrapper">
                  <ListingCard listing={listing} onClick={(l) => setSelectedListing(l)} />
                  {listing.distance !== undefined && (
                    <div className="distance-badge">
                      {listing.distance.toFixed(1)} km away
                    </div>
                  )}
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
