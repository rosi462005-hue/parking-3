import React from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero">
      <div className="container hero-container">
        <div className="hero-content">
          <h1 className="hero-title">
            Find Parking in Seconds.
          </h1>
          <p className="hero-subtitle">
            ParkShare connects drivers with nearby parking spaces in real-time.
          </p>
          
          <div className="hero-cta-group">
            <Link to="/search" className="btn btn-primary">Find Space</Link>
            <button className="btn btn-secondary" onClick={() => document.getElementById('earn')?.scrollIntoView({ behavior: 'smooth' })}>List Your Space</button>
          </div>


        </div>
        
        <div className="hero-visual">
          <div className="hero-image-wrapper">
            <img 
              src="https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80&w=1000" 
              alt="Parking spaces" 
              className="hero-image"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
