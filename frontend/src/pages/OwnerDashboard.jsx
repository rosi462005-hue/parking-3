import React, { useState, useEffect } from 'react';

const OwnerDashboard = () => {
  const [bookings, setBookings] = useState([]); // Bookings on my properties (as owner)
  const [myReservations, setMyReservations] = useState([]); // Bookings I made (as renter)
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('parkshare_token');
        if (!token) throw new Error("Authentication required");

        const apiBase = 'http://127.0.0.1:8001'; // Standardized IP for better resolution
        const endpoint = '/api';
        const headers = { 'Authorization': `Bearer ${token}` };

        const [bookingsRes, listingsRes, reservationsRes] = await Promise.all([
          fetch(`${apiBase}${endpoint}/bookings/owner`, { headers }),
          fetch(`${apiBase}${endpoint}/listings/my-listings`, { headers }),
          fetch(`${apiBase}${endpoint}/bookings/`, { headers })
        ]);

        if (!bookingsRes.ok || !listingsRes.ok || !reservationsRes.ok) {
          throw new Error("Failed to fetch dashboard metrics");
        }

        const [bookingsData, listingsData, reservationsData] = await Promise.all([
          bookingsRes.json(),
          listingsRes.json(),
          reservationsRes.json()
        ]);

        setBookings(bookingsData);
        setListings(listingsData);
        setMyReservations(reservationsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Compute Earnings Constraints
  const calculateEarnings = () => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    // Calculate week start directly (7 days trailing for simplicity)
    const weekStart = todayStart - (7 * 24 * 60 * 60 * 1000);

    let total = 0;
    let today = 0;
    let weekly = 0;

    bookings.forEach(b => {
      if (b.status === 'cancelled') return;

      const price = b.listings?.price_per_hour || 0;
      const earnings = price * b.duration_hours;
      
      total += earnings;

      // Extract raw timestamp into native epoch comparison
      const bookingTime = new Date(b.created_at).getTime();
      if (bookingTime >= todayStart) today += earnings;
      if (bookingTime >= weekStart) weekly += earnings;
    });

    return { total, today, weekly };
  };

  const earnings = calculateEarnings();

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem('parkshare_token');
      const res = await fetch(`http://127.0.0.1:8001/api/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Failed to cancel booking");
      }
      // Update local state
      setMyReservations(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
      alert("Booking cancelled successfully!");
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteListing = async (listingId) => {
    if (!window.confirm("Are you sure you want to delete this listing? This action cannot be undone.")) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem('parkshare_token');
      const res = await fetch(`http://127.0.0.1:8001/api/listings/${listingId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Failed to delete listing");
      }
      setListings(prev => prev.filter(l => l.id !== listingId));
      alert("Listing deleted successfully!");
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="loading-screen" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Dashboard...</div>;
  if (error) return <div className="error-message" style={{ margin: '50px', textAlign: 'center', color: '#d9534f' }}>{error}</div>;

  return (
    <div className="dashboard-section section" style={{ paddingTop: '100px', minHeight: 'calc(100vh - 100px)', backgroundColor: '#f9f9f9' }}>
      <div className="container">
        <div className="section-header text-center">
          <h2 className="section-title">Owner Dashboard</h2>
          <p className="section-subtitle">Track your platform earnings, active properties, and reservations.</p>
        </div>

        {/* EARNINGS SUMMARY CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          <div style={{ background: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderLeft: '5px solid #007bff' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem', color: '#666' }}>Total Earnings</h3>
            <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#333' }}>₹{earnings.total}</p>
          </div>
          <div style={{ background: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderLeft: '5px solid #28a745' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem', color: '#666' }}>Earnings Today</h3>
            <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#333' }}>₹{earnings.today}</p>
          </div>
          <div style={{ background: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderLeft: '5px solid #17a2b8' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem', color: '#666' }}>Trailing 7 Days</h3>
            <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#333' }}>₹{earnings.weekly}</p>
          </div>
        </div>

        {/* BOOKINGS TABLE */}
        <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '40px' }}>
          <h3 style={{ borderBottom: '2px solid #eee', paddingBottom: '15px', marginBottom: '20px' }}>Recent Bookings</h3>
          {bookings.length === 0 ? (
            <p style={{ color: '#777' }}>You have no bookings yet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f4f4f4', color: '#555' }}>
                    <th style={{ padding: '12px' }}>Property</th>
                    <th style={{ padding: '12px' }}>Start Time</th>
                    <th style={{ padding: '12px' }}>Duration</th>
                    <th style={{ padding: '12px' }}>Vehicle</th>
                    <th style={{ padding: '12px' }}>Earnings</th>
                    <th style={{ padding: '12px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px', fontWeight: 'bold' }}>{b.listings?.title || 'Unknown Space'}</td>
                      <td style={{ padding: '12px' }}>{new Date(b.start_time).toLocaleString()}</td>
                      <td style={{ padding: '12px' }}>{b.duration_hours} hr</td>
                      <td style={{ padding: '12px' }}>{b.vehicle_type}</td>
                      <td style={{ padding: '12px', color: '#28a745', fontWeight: 'bold' }}>
                        ₹{(b.listings?.price_per_hour || 0) * b.duration_hours}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ 
                          padding: '4px 8px', borderRadius: '12px', fontSize: '0.85rem',
                          backgroundColor: b.status === 'confirmed' ? '#d4edda' : b.status === 'cancelled' ? '#f8d7da' : '#e2e3e5',
                          color: b.status === 'confirmed' ? '#155724' : b.status === 'cancelled' ? '#721c24' : '#383d41'
                        }}>
                          {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* MY RESERVATIONS TABLE (AS RENTER) */}
        <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '40px' }}>
          <h3 style={{ borderBottom: '2px solid #eee', paddingBottom: '15px', marginBottom: '20px' }}>My Reservations</h3>
          {myReservations.length === 0 ? (
            <p style={{ color: '#777' }}>You have no reservations made.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f4f4f4', color: '#555' }}>
                    <th style={{ padding: '12px' }}>Spot ID</th>
                    <th style={{ padding: '12px' }}>Start Time</th>
                    <th style={{ padding: '12px' }}>Duration</th>
                    <th style={{ padding: '12px' }}>Cost</th>
                    <th style={{ padding: '12px' }}>Status</th>
                    <th style={{ padding: '12px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {myReservations.map((b) => (
                    <tr key={b.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px', fontSize: '0.85rem' }}>{b.listing_id}</td>
                      <td style={{ padding: '12px' }}>{new Date(b.start_time).toLocaleString()}</td>
                      <td style={{ padding: '12px' }}>{b.duration_hours} hr</td>
                      <td style={{ padding: '12px' }}>₹{b.total_cost}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ 
                          padding: '4px 8px', borderRadius: '12px', fontSize: '0.85rem',
                          backgroundColor: b.status === 'confirmed' ? '#d4edda' : b.status === 'cancelled' ? '#f8d7da' : '#e2e3e5',
                          color: b.status === 'confirmed' ? '#155724' : b.status === 'cancelled' ? '#721c24' : '#383d41'
                        }}>
                          {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        {b.status === 'confirmed' && (
                          <button 
                            onClick={() => handleCancelBooking(b.id)}
                            disabled={actionLoading}
                            style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h3 style={{ borderBottom: '2px solid #eee', paddingBottom: '15px', marginBottom: '20px' }}>My Active Properties</h3>
          {listings.length === 0 ? (
            <p style={{ color: '#777' }}>You haven't listed any spaces yet.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              {listings.map((listing) => (
                <div key={listing.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>{listing.title}</h4>
                  <p style={{ margin: '0 0 15px 0', fontSize: '0.9rem', color: '#666' }}>{listing.location}</p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                    <span style={{ fontWeight: 'bold', color: '#28a745' }}>₹{listing.price_per_hour}/hr</span>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <span style={{ 
                        fontSize: '0.85rem', padding: '3px 8px', borderRadius: '4px',
                        backgroundColor: listing.available ? '#d4edda' : '#fff3cd',
                        color: listing.available ? '#155724' : '#856404'
                      }}>
                        {listing.available ? '● Available' : '● Booked'}
                      </span>
                      <button
                        onClick={() => handleDeleteListing(listing.id)}
                        disabled={actionLoading}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc3545', fontSize: '1.2rem', padding: '5px' }}
                        title="Delete Listing"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default OwnerDashboard;
