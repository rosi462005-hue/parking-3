import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../components/ParkingSearch.css';

const SearchPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searching, setSearching] = useState(false);
  const navigate = useNavigate();

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

      // Navigate to results page passing the data
      navigate('/results', { state: { listings: processed, userLocation: {lat, lng} } });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setSearching(false);
    }
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
              {searching ? 'Finding Nearest Slots...' : 'Find Space'}
            </button>
            <Link to="/list" className="btn btn-secondary">List Your Space</Link>
          </div>
        </div>

        <div className="results-container">
          {loading && <div className="status-message">Searching for nearby spots...</div>}
          {error && <div className="status-message error">{error}</div>}
        </div>
      </div>
    </section>
  );
};

export default SearchPage;
