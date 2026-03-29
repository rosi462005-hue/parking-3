import React, { useState } from 'react';
import './ListingCard.css';

const ListingCard = ({ listing, onClick, onDelete }) => {
  const [isDeleted, setIsDeleted] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fix data binding mapping the backend python models to frontend schema safely
  const rawRate = listing.pricePerHour || listing.price_per_hour || listing.price || 0;
  
  // Parse mathematically converting explicitly
  const parsedRate = parseFloat(String(rawRate).replace(/[^0-9.]/g, ''));
  const finalRate = !isNaN(parsedRate) ? parsedRate : 0;

  // 1. Developer-only access check (Simple role check using fixed email)
  const token = localStorage.getItem('parkshare_token');
  let isAdmin = false;
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      isAdmin = payload.email === 'admin@parkshare.com';
    } catch (e) {
      // Ignore decoding errors
    }
  }

  // 4. Delete functionality
  const handleDelete = async (e) => {
    e.stopPropagation(); // Prevent card click
    if (!window.confirm("Are you sure you want to remove this listing?")) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/listings/${listing.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      // 204 No Content is expected on success, or 200 with data
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to delete from server");
      }
      
      // Update from UI completely or falback
      if (onDelete) {
        onDelete(listing.id);
      } else {
        setIsDeleted(true);
      }
    } catch (err) {
      console.error("Delete failed:", err);
      alert(err.message || "Failed to delete the listing.");
      setIsDeleting(false);
    }
  };

  if (isDeleted) return null;

  return (
    <div className={`listing-card ${!listing.available ? 'unavailable' : ''}`} style={isDeleting ? { opacity: 0.5 } : {}}>
      <div className="listing-card-header">
        <h4 className="listing-title">{listing.title}</h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="listing-price">₹{finalRate}/hr</span>
          {/* 3. Show Delete button ONLY if admin */}
          {isAdmin && (
            <button 
              className="btn btn-sm btn-outline" 
              style={{ color: 'red', borderColor: 'red', padding: '2px 8px' }}
              onClick={handleDelete}
              disabled={isDeleting}
              title="Developer Only: Delete Listing"
            >
              {isDeleting ? '...' : 'Delete'}
            </button>
          )}
        </div>
      </div>
      <p className="listing-location">{listing.location}</p>
      <div className="listing-footer">
        <span className={`status-badge ${listing.available ? 'available' : 'booked'}`}>
          {listing.available ? 'Available Now' : 'Booked'}
        </span>
        <button
          className="btn btn-sm btn-outline"
          disabled={!listing.available || isDeleting}
          onClick={() => onClick && onClick(listing)}
        >
          {listing.available ? 'Book Now' : 'Not Available'}
        </button>
      </div>
    </div>
  );
};

export default ListingCard;
