import React, { useState } from 'react';
import './ParkingSearch.css';
import ListingCard from './ListingCard';
import BookingModal from './BookingModal';

const ParkingSearch = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [searching, setSearching] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);

  // Haversine formula to calculate distance in km
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
        fetchNearbyListings(latitude, longitude);
      },
      () => {
        setError("Unable to retrieve your location. Please check permissions.");
        setSearching(false);
      }
    );
  };

  const fetchNearbyListings = async (lat, lng) => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/api/listings');
      if (!response.ok) throw new Error('Failed to fetch listings');

      const data = await response.json();

      const processed = data.map(spot => ({
        ...spot,
        distance: getDistance(lat, lng, spot.lat, spot.lng)
      })).sort((a, b) => a.distance - b.distance);

      setListings(processed);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  return (
    <section className="parking-search-section section" id="locations">
      <div className="container">
        <div className="section-header text-center">
          <h2 className="section-title">Find a Parking Space</h2>
          <p className="section-subtitle">Connect with real-time availability near you.</p>
          <button
            className={`btn btn-primary find-space-btn ${searching ? 'loading' : ''}`}
            onClick={handleFindSpace}
            disabled={searching}
          >
            {searching ? 'Finding Nearest Slots...' : 'Find Space'}
          </button>
        </div>

        <div className="results-container">
          {loading && <div className="status-message">Searching for nearby spots...</div>}
          {error && <div className="status-message error">{error}</div>}

          {!loading && !error && userLocation && listings.length === 0 && (
            <div className="status-message warning">No spaces found in your area.</div>
          )}

          {!loading && !error && listings.length > 0 && (
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

export default ParkingSearch;
