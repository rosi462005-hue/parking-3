import React from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero">
      <div className="container hero-container" style={{ textAlign: 'left' }}>
        <div className="hero-content">
          <h1 className="hero-title">
            Find Parking in Seconds.
          </h1>
          <p className="hero-subtitle">
            ParkShare connects drivers with nearby parking spaces in real-time.
          </p>
          
          <div className="hero-cta-group" style={{ justifyContent: 'flex-start' }}>
            <Link to="/search" className="btn btn-primary">Find Space</Link>
            <button className="btn btn-secondary" onClick={() => document.getElementById('earn')?.scrollIntoView({ behavior: 'smooth' })}>List Your Space</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
