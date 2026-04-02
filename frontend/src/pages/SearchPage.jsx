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
  const [userVehicle, setUserVehicle] = useState('both');
  const navigate = useNavigate();

  const fetchAllListings = async (userLat = null, userLng = null, vehicleType = null) => {
    setLoading(true);
    try {
      let url = 'http://127.0.0.1:8001/api/listings/';
      const params = new URLSearchParams();
      if (userLat !== null && userLng !== null) {
        params.append('lat', userLat);
        params.append('lng', userLng);
      }
      if (vehicleType) {
        params.append('vehicle_type', vehicleType);
      }
      if (params.toString()) {
        url += '?' + params.toString();
      }
      const response = await fetch(url);
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

  const handleFindSpace = async () => {
    setHasSearched(true);
    setSearching(true);
    setError(null);
    setNearbyListings(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setSearching(false);
      return;
    }

    try {
      // 1. Await geolocation permission via Promise wrapper for safe async execution
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
      });

      const { latitude: userLat, longitude: userLng } = position.coords;
      setUserLocation({ lat: userLat, lng: userLng });

      // 2. Safely call API only AFTER valid coordinates are obtained
      const data = await fetchAllListings(userLat, userLng, userVehicle);
      if (!data) {
        setSearching(false);
        return;
      }
      console.log("Debug: All fetched listings from API:", data);

      // 3. Add distance for display (already sorted by backend)
      const processed = data.map(spot => {
        const spotLat = spot.lat !== undefined ? spot.lat : spot.latitude;
        const spotLng = spot.lng !== undefined ? spot.lng : spot.longitude;
        
        let distance = NaN;
        if (spotLat != null && spotLng != null) {
          distance = getDistance(userLat, userLng, parseFloat(spotLat), parseFloat(spotLng));
        }
        
        return { ...spot, distance };
      });
      
      console.log("Debug: Processed listings:", processed);
      
      setNearbyListings(processed);

    } catch (err) {
      console.error("Error resolving nearby spaces:", err);
      // Differentiate Geolocation Errors vs standard application errors
      if (err.code !== undefined) {
        let errorMessage = "Location access denied. Please enable location to find nearby spaces.";
        if (err.code === err.TIMEOUT) {
          errorMessage = "Location request timed out. Please try again.";
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          errorMessage = "Location information is unavailable.";
        }
        setError(errorMessage);
      } else {
        setError("An unexpected error occurred while fetching nearby listings.");
      }
    } finally {
      setSearching(false);
    }
  };

  return (
    <section className="parking-search-section section" style={{paddingTop: '100px', minHeight: 'calc(100vh - 100px)'}}>
      <div className="container">
        <div className="section-header text-center">
          <h2 className="section-title">ParkShare</h2>
          <p className="section-subtitle">Find and book parking spots near your current location.</p>
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '30px', marginTop: '20px', alignItems: 'center' }}>
            {/* Vehicle dropdown removed intentionally 
            <select 
              className="form-input" 
              style={{ maxWidth: '200px', margin: 0, padding: '10px' }}
              value={userVehicle}
              onChange={(e) => setUserVehicle(e.target.value)}
              disabled={searching}
            >
              <option value="both">All Vehicles</option>
              <option value="2-wheeler">2-Wheeler</option>
              <option value="4-wheeler">4-Wheeler</option>
            </select>
            */}
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
