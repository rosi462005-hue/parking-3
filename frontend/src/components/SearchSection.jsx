import React, { useState } from 'react';
import './SearchSection.css';

const MOCK_DB = [
  { id: 1, title: 'Mumbai Central Parking', location: 'Mumbai Central, Mumbai', price: '₹40/hr', distance: 1.2, available: true },
  { id: 2, title: 'Bandra BKC Spot', location: 'BKC, Mumbai', price: '₹60/hr', distance: 3.5, available: true },
  { id: 3, title: 'Connaught Place Garage', location: 'Connaught Place, Delhi', price: '₹50/hr', distance: 2.1, available: true },
  { id: 4, title: 'Indiranagar Plot', location: 'Indiranagar, Bangalore', price: '₹30/hr', distance: 4.0, available: true },
  { id: 5, title: 'T-Nagar Dedicated Spot', location: 'T-Nagar, Chennai', price: '₹45/hr', distance: 1.5, available: true }
];

const SearchSection = () => {
  const [query, setQuery] = useState('');
  const [radius, setRadius] = useState(5);
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState([]);

  const handleSearch = (e) => {
    e.preventDefault();
    setHasSearched(true);
    
    const q = query.toLowerCase().trim();
    if (!q) {
      setResults([]);
      return;
    }

    const filtered = MOCK_DB.filter(spot => {
      const matchLoc = spot.location.toLowerCase().includes(q) || spot.title.toLowerCase().includes(q);
      const matchRad = spot.distance <= radius;
      return matchLoc && matchRad;
    });

    setResults(filtered);
  };

  return (
    <section className="search-section section bg-light" id="locations">
      <div className="container">
        <div className="section-header text-center">
          <h2 className="section-title">Find Parking Near You</h2>
          <p className="section-subtitle">Search for designated parking spaces across India.</p>
        </div>

        <div className="search-widget">
          <form className="search-form" onSubmit={handleSearch}>
            <input 
              type="text" 
              className="search-input-dynamic" 
              placeholder="Enter location (e.g. Mumbai, Delhi)..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <select 
              className="search-select-dynamic" 
              value={radius} 
              onChange={(e) => setRadius(Number(e.target.value))}
            >
              <option value={1}>1 km radius</option>
              <option value={2}>2 km radius</option>
              <option value={5}>5 km radius</option>
              <option value={10}>10 km radius</option>
            </select>
            <button type="submit" className="btn btn-primary search-btn-dynamic">Search</button>
          </form>
        </div>

        <div className="search-results">
          {hasSearched && results.length === 0 && (
            <div className="no-results text-center">
              <h3>No slots nearby</h3>
              <p>Try searching a different location or increasing your radius.</p>
            </div>
          )}

          {hasSearched && results.length > 0 && (
            <div className="spots-grid">
              {results.map(spot => (
                <div className="spot-card" key={spot.id}>
                  <div className="spot-info">
                    <div className="spot-header">
                      <h3 className="spot-title">{spot.title}</h3>
                      <div className="spot-price">{spot.price}</div>
                    </div>
                    <div className="spot-details">
                      <span className="spot-type">{spot.location}</span>
                      <span className="spot-distance">{spot.distance} km away</span>
                    </div>
                    <button className="btn btn-primary w-100" style={{ marginTop: '1rem' }}>
                      Book This Spot
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SearchSection;
