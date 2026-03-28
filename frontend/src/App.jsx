import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';

import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import Home from './pages/Home';
import SearchPage from './pages/SearchPage';
import ListPage from './pages/ListPage';
import ResultsPage from './pages/ResultsPage';

function App() {
  const [user, setUser] = React.useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = React.useState(true);
  const [authMode, setAuthMode] = React.useState('login');

  React.useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('parkshare_token');
      if (!token) {
        setIsCheckingAuth(false);
        return;
      }
      try {
        const response = await fetch('http://127.0.0.1:8000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          localStorage.removeItem('parkshare_token');
        }
      } catch (err) {
        console.error('Auth verification failed', err);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('parkshare_token');
    setUser(null);
  };

  if (isCheckingAuth) {
    return <div className="loading-screen">Loading ParkShare...</div>;
  }

  return (
    <Router>
      <div className="App">
        {!user ? (
          <div className="mandatory-auth">
            <AuthModal 
              isOpen={true} 
              onClose={() => {}} // No closing for mandatory auth
              mode={authMode} 
              setMode={setAuthMode}
              onLogin={setUser}
            />
          </div>
        ) : (
          <>
            <header className="header">
              <Link to="/" className="logo" style={{ textDecoration: 'none' }}>
                Park<span>Share</span>
              </Link>
              <nav className="nav-links">
                {user && (
                  <div className="user-menu">
                    <span className="user-greeting">Hi, {user.name}</span>
                    <button className="btn btn-secondary" onClick={handleLogout}>Logout</button>
                  </div>
                )}
              </nav>
              <button className="mobile-menu-btn">☰</button>
            </header>

            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/list" element={<ListPage />} />
                <Route path="/results" element={<ResultsPage />} />
              </Routes>
            </main>

            <Footer />
          </>
        )}
      </div>
    </Router>
  );
}

export default App;
