import React from 'react';
import { Link } from 'react-router-dom';
import './ParkingSearch.css';

const ParkingSearch = () => {
  return (
    <section className="parking-search-section section" id="locations">
      <div className="container">
        <div className="section-header text-center">
          <h2 className="section-title">ParkShare</h2>
          <p className="section-subtitle">Find and book parking spots near your current location.</p>
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '20px' }}>
            <Link to="/search" className="btn btn-primary">Find Space</Link>
            <Link to="/list" className="btn btn-secondary">List Your Space</Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ParkingSearch;
