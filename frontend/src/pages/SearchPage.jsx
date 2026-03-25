import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../components/ParkingSearch.css';
import ListingCard from '../components/ListingCard';
import BookingModal from '../components/BookingModal';

const SearchPage = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [searching, setSearching] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);

  const fetchAllListings = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/api/listings');
      if (!response.ok) throw new Error('Failed to fetch listings');
      const data = await response.json();
      setListings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllListings();
  }, []);

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const deg2rad = (deg) => deg * (Math.PI / 180);

  const handleFindSpace = () => {
    setSearching(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setSearching(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        
        // Sort existing listings by distance
        const processed = [...listings].map(spot => ({
          ...spot,
          distance: getDistance(latitude, longitude, spot.lat, spot.lng)
        })).sort((a, b) => a.distance - b.distance);
        
        setSearching(false);
        navigate('/results', { state: { listings: processed, userLocation: {lat: latitude, lng: longitude} } });
      },
      () => {
        setSearching(false);
        navigate('/results', { state: { listings: listings, userLocation: null } });
      }
    );
  };

  return (
    <section className="parking-search-section section" style={{paddingTop: '100px', minHeight: 'calc(100vh - 100px)'}}>
      <div className="container">
        <div className="section-header text-center">
          <h2 className="section-title">ParkShare</h2>
          <p className="section-subtitle">Find and book parking spots near your current location.</p>
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '30px', marginTop: '20px' }}>
            <button 
              className={`btn btn-primary ${searching ? 'loading' : ''}`} 
              onClick={handleFindSpace} 
              disabled={searching}
            >
              {searching ? 'Sorting by Distance...' : 'Find Space Nearby'}
            </button>
            <Link to="/list" className="btn btn-secondary">List Your Space</Link>
          </div>
        </div>

        <div className="results-container">
          {loading && <div className="status-message">Loading parking spots...</div>}
          {error && <div className="status-message error">{error}</div>}

          {!loading && !error && listings.length === 0 && (
            <div className="status-message warning">No spaces found in your area. Be the first to list one!</div>
          )}

          {!loading && !error && listings.length > 0 && (
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

export default SearchPage;
