import React from 'react';
import './ListingCard.css';

const ListingCard = ({ listing, onClick }) => {
  // Fix data binding mapping the backend python models to frontend schema safely
  const rawRate = listing.pricePerHour || listing.price_per_hour || listing.price || 0;
  
  // Debug support to verify incoming structures inside the JS console
  console.log("Rendering listing data to card:", listing);
  
  // Parse mathematically converting explicitly
  const parsedRate = parseFloat(String(rawRate).replace(/[^0-9.]/g, ''));
  const finalRate = !isNaN(parsedRate) ? parsedRate : 0;

  return (
    <div className={`listing-card ${!listing.available ? 'unavailable' : ''}`}>
      <div className="listing-card-header">
        <h4 className="listing-title">{listing.title}</h4>
        <span className="listing-price">₹{finalRate}/hr</span>
      </div>
      <p className="listing-location">{listing.location}</p>
      <div className="listing-footer">
        <span className={`status-badge ${listing.available ? 'available' : 'booked'}`}>
          {listing.available ? 'Available Now' : 'Booked'}
        </span>
        <button
          className="btn btn-sm btn-outline"
          disabled={!listing.available}
          onClick={() => onClick && onClick(listing)}
        >
          {listing.available ? 'Book Now' : 'Not Available'}
        </button>
      </div>
    </div>
  );
};

export default ListingCard;
