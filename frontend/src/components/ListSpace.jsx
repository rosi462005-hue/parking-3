import React, { useState } from 'react';
import './ListSpace.css';

const ListSpace = () => {
  const [formData, setFormData] = useState({
    title: '',
    address: '',
    price: '',
    type: 'driveway',
    description: ''
  });
  const [vehicleType, setVehicleType] = useState('both');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // 1. Validate Required Fields Front-end
    if (!formData.title || formData.title.length < 3) {
      setError('Space Title must be at least 3 characters.');
      return;
    }
    if (!formData.address || formData.address.length < 3) {
      setError('Full Address must be at least 3 characters.');
      return;
    }
    const parsedPrice = parseInt(formData.price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setError('Please provide a valid positive price.');
      return;
    }

    // 2. Form payload with all necessary fields
    const listingData = {
      title: formData.title,
      location: formData.address,
      description: formData.description || null,
      price_per_hour: parsedPrice,
      vehicle_type: vehicleType,
      type: formData.type,
      lat: 19.0760 + (Math.random() - 0.5) * 0.1,
      lng: 72.8777 + (Math.random() - 0.5) * 0.1
    };

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('parkshare_token');
      const response = await fetch('http://127.0.0.1:8000/api/listings/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(listingData),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        let errMsg = 'Failed to create listing.';
        // Extract FastAPI validation details if present
        if (err.detail) {
          errMsg = Array.isArray(err.detail) 
            ? err.detail.map(d => d.msg).join(', ') 
            : err.detail;
        }
        throw new Error(errMsg);
      }

      console.log('Listing created successfully');
      setSubmitted(true);
      
      // Reset form after a delay
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ title: '', address: '', price: '', type: 'driveway', description: '' });
        setImage(null);
        setImagePreview(null);
      }, 3000);
    } catch (err) {
      console.error('Error creating listing:', err);
      // Display the specific message instead of alert
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="list-space-section section" id="earn">
      <div className="container">
        <div className="section-header text-center">
          <h2 className="section-title">List Your Space</h2>
          <p className="section-subtitle">Earn money by renting out your unused parking spot.</p>
        </div>

        <div className="list-space-card">
          {submitted ? (
            <div className="success-message text-center">
              <div className="success-icon">✅</div>
              <h3>Listing Submitted!</h3>
              <p>Your space will be reviewed and listed shortly. Thank you!</p>
            </div>
          ) : (
            <form className="list-space-form" onSubmit={handleSubmit}>
              {error && (
                <div className="error-message" style={{ color: '#d9534f', backgroundColor: '#fdf7f7', padding: '10px', borderRadius: '5px', marginBottom: '15px', border: '1px solid #d9534f', textAlign: 'center' }}>
                  {error}
                </div>
              )}
              <div className="form-group">
                <label htmlFor="title">Space Title</label>
                <input 
                  type="text" 
                  id="title" 
                  name="title" 
                  placeholder="e.g., Secure Downtown Garage" 
                  value={formData.title}
                  onChange={handleChange}
                  required 
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="price">Price per Hour (₹)</label>
                  <input 
                    type="number" 
                    id="price" 
                    name="price" 
                    placeholder="e.g. 50" 
                    value={formData.price}
                    onChange={handleChange}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="type">Space Type</label>
                  <select 
                    id="type" 
                    name="type" 
                    value={formData.type}
                    onChange={handleChange}
                  >
                    <option value="driveway">Private Driveway</option>
                    <option value="garage">Covered Garage</option>
                    <option value="lot">Open Lot</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Accepted Vehicle Types</label>
                <div className="vehicle-type-selector">
                  {[
                    { value: '2-wheeler', label: '🛵 2-Wheeler' },
                    { value: '4-wheeler', label: '🚗 4-Wheeler' },
                    { value: 'both',      label: '✅ Both'      },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`vehicle-type-btn ${vehicleType === opt.value ? 'active' : ''}`}
                      onClick={() => setVehicleType(opt.value)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="address">Full Address</label>
                <input 
                  type="text" 
                  id="address" 
                  name="address" 
                  placeholder="Street name, Area, City" 
                  value={formData.address}
                  onChange={handleChange}
                  required 
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Short Description (optional)</label>
                <textarea 
                  id="description" 
                  name="description" 
                  rows="3" 
                  placeholder="Tell renters more about your spot..."
                  value={formData.description}
                  onChange={handleChange}
                ></textarea>
              </div>

              <div className="form-group">
                <label>Upload a Picture of Your Spot</label>
                <div className="image-upload-wrapper">
                  <input 
                    type="file" 
                    id="image" 
                    name="image" 
                    accept="image/*"
                    onChange={handleImageChange}
                    className="image-input"
                  />
                  <label htmlFor="image" className="image-upload-label">
                    {imagePreview ? (
                      <div className="image-preview">
                        <img src={imagePreview} alt="Spot preview" />
                        <div className="change-image-overlay">Change Image</div>
                      </div>
                    ) : (
                      <div className="upload-placeholder">
                        <span className="upload-icon">📷</span>
                        <span>Click to upload an image</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-100 btn-large" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Listing'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default ListSpace;
