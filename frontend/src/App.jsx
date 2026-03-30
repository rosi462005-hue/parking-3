import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';

import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import Home from './pages/Home';
import SearchPage from './pages/SearchPage';
import ListPage from './pages/ListPage';
import ResultsPage from './pages/ResultsPage';
import OwnerDashboard from './pages/OwnerDashboard';

function App() {
  const [user, setUser] = React.useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = React.useState(true);
  const [authMode, setAuthMode] = React.useState('login');

  React.useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20-second timeout if hanging

    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('parkshare_token');
        if (!token) {
          if (isMounted) setIsCheckingAuth(false);
          return;
        }

        const response = await fetch('http://127.0.0.1:8001/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          signal: controller.signal
        });

        if (response.ok) {
          const userData = await response.json();
          if (isMounted) setUser(userData);
        } else {
          localStorage.removeItem('parkshare_token');
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          console.log('Auth check aborted due to timeout or unmount.');
        } else {
          console.error('Auth verification failed:', err);
        }
      } finally {
        clearTimeout(timeoutId);
        if (isMounted) setIsCheckingAuth(false);
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
      controller.abort(); // Cancel hanging request if component unmounts
    };
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
                    <Link to="/dashboard" className="btn btn-secondary" style={{ marginLeft: '10px', textDecoration: 'none' }}>Dashboard</Link>
                    <button className="btn btn-secondary" onClick={handleLogout} style={{ marginLeft: '10px' }}>Logout</button>
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
                <Route path="/dashboard" element={<OwnerDashboard />} />
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
