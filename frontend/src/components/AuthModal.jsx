import React, { useState } from 'react';
import './AuthModal.css';

const AuthModal = ({ isOpen, onClose, mode, setMode, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const validate = () => {
    if (mode === 'signup') {
      if (!name.trim()) return 'Name is required';
      if (password !== confirmPassword) return 'Passwords do not match';
    }
    if (password.length < 6) return 'Password must be at least 6 characters';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return null;
  };

  const handleSubmit = async (e) => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      setIsLoading(false);
      return;
    }

    try {
      const endpoint = mode === 'login' ? '/api/auth/login/' : '/api/auth/register/';
      const body = mode === 'login' ? { email, password } : { name, email, password };

      const response = await fetch(`http://127.0.0.1:8000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.error || 'Something went wrong');
      }

      // Store JWT for subsequent authenticated requests
      if (data.token) {
        localStorage.setItem('parkshare_token', data.token);
      }

      // Success
      onLogin(data.user || { name: email.split('@')[0] });
      onClose();
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`modal-overlay ${!onClose || onClose.toString().includes('() => {}') ? 'mandatory' : ''}`}>
      <div className="modal-content auth-vivid">
        {onClose && !onClose.toString().includes('() => {}') && (
          <button className="close-btn" onClick={onClose}>&times;</button>
        )}
        <div className="auth-brand">
          <span className="brand-icon">🚗</span>
          <h2>Park<span>Share</span></h2>
        </div>
        <h2 className="modal-title">{mode === 'login' ? 'Welcome Back' : 'Join ParkShare'}</h2>
        <p className="modal-subtitle">{mode === 'login' ? 'Sign in to access your dashboard' : 'Create an account to start parking better'}</p>
        
        {error && <div className="error-message vivify-shake">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'signup' && (
            <div className="form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                placeholder="John Doe"
              />
            </div>
          )}
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              placeholder="you@example.com"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              placeholder="••••••••"
            />
          </div>
          {mode === 'signup' && (
            <div className="form-group">
              <label>Confirm Password</label>
              <input 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required 
                placeholder="••••••••"
              />
            </div>
          )}
          <button type="submit" className="btn btn-primary w-100 btn-glow" disabled={isLoading}>
            {isLoading ? 'Processing...' : mode === 'login' ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <p className="modal-footer-text">
          {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
          <button 
            className="link-btn" 
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setError('');
            }}
          >
            {mode === 'login' ? 'Create Account' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthModal;
