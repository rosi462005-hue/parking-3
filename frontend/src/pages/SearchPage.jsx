import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/ParkingSearch.css';
import ListingCard from '../components/ListingCard';
import BookingModal from '../components/BookingModal';

const SearchPage = () => {
  const [allListings, setAllListings] = useState([]);
  const [nearbyListings, setNearbyListings] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [searching, setSearching] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const navigate = useNavigate();

  const fetchAllListings = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/listings/');
      if (!response.ok) throw new Error('Failed to fetch listings');
      const data = await response.json();
      setAllListings(data);
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

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
    setHasSearched(true);
    setSearching(true);
    setError(null);
    setNearbyListings(null);

    console.log("Validating geolocation support...");

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setSearching(false);
      return;
    }

    console.log("Requesting browser geolocation permission...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        console.log("Geolocation permission granted! Coordinates:", position.coords);
        const { latitude: userLat, longitude: userLng } = position.coords;
        setUserLocation({ lat: userLat, lng: userLng });
        
        // Fetch listings AFTER getting location to not block the browser permission popup
        const data = await fetchAllListings();
        if (!data) {
          setSearching(false);
          return;
        }

        // Filter and sort listings gracefully without mutating original array
        const processed = data
          .map(spot => {
            const spotLat = spot.lat !== undefined ? spot.lat : spot.latitude;
            const spotLng = spot.lng !== undefined ? spot.lng : spot.longitude;
            
            if (spotLat == null || spotLng == null) {
              return { ...spot, distance: NaN };
            }
            
            return {
              ...spot,
              distance: getDistance(userLat, userLng, parseFloat(spotLat), parseFloat(spotLng))
            };
          })
          .filter(spot => !isNaN(spot.distance) && spot.distance <= 5)
          .sort((a, b) => a.distance - b.distance);
        
        setNearbyListings(processed);
        setSearching(false);
      },
      (geoError) => {
        console.error("Geolocation error occurred:", geoError);
        setSearching(false);
        let errorMessage = "Location access denied. Please enable location to find nearby spaces.";
        // Handle explicit error code overrides
        if (geoError.code === geoError.TIMEOUT) {
          errorMessage = "Location request timed out. Please try again.";
        } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
          errorMessage = "Location information is unavailable.";
        }
        setError(errorMessage);
      },
      { timeout: 10000 } // adding fallback 10s timeout setting
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
              {searching ? 'Fetching your location...' : 'Find Space Nearby'}
            </button>
          </div>
        </div>

        <div className="results-container">
          {!hasSearched && !loading && !error && (
            <div className="status-message info" style={{ color: '#007bff', marginBottom: '15px' }}>
              Click 'Find Space Nearby' to see available parking spots.
            </div>
          )}

          {loading && <div className="status-message">Loading parking spots...</div>}
          {error && (
            <div className="status-message error">
              <p>{error}</p>
              <div style={{ marginTop: '15px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <input 
                  type="text" 
                  placeholder="Enter location manually..." 
                  className="form-input" 
                  style={{ maxWidth: '300px' }}
                />
                <button className="btn btn-secondary" onClick={() => alert('Manual search coming soon!')}>
                  Search
                </button>
              </div>
            </div>
          )}

          {nearbyListings && !loading && !error && (
            <div className="status-message success" style={{ color: 'green', marginBottom: '15px', fontWeight: 'bold' }}>
              Showing nearby spaces
            </div>
          )}

          {hasSearched && !loading && !error && nearbyListings && nearbyListings.length === 0 && (
            <div className="status-message warning">No spaces found in your area.</div>
          )}

          {hasSearched && !loading && !error && nearbyListings && nearbyListings.length > 0 && (
            <div className="listings-grid">
              {nearbyListings.map(listing => (
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
