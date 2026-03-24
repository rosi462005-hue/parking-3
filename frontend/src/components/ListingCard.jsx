import React from 'react';
import './ListingCard.css';

const ListingCard = ({ listing, onClick }) => {
  return (
    <div className={`listing-card ${!listing.available ? 'unavailable' : ''}`}>
      <div className="listing-card-header">
        <h4 className="listing-title">{listing.title}</h4>
        <span className="listing-price">₹{listing.pricePerHour}/hr</span>
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
