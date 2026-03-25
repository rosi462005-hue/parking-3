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
  const [isAuthOpen, setIsAuthOpen] = React.useState(false);
  const [authMode, setAuthMode] = React.useState('login');
  const [user, setUser] = React.useState(null);

  const handleOpenAuth = (mode) => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <Router>
      <div className="App">
        <header className="header">
          <Link to="/" className="logo" style={{ textDecoration: 'none' }}>
            Park<span>Share</span>
          </Link>
        <nav className="nav-links">

          {user ? (
            <div className="user-menu">
              <span className="user-greeting">Hi, {user.name}</span>
              <button className="btn btn-secondary" onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            <>
              <button className="btn btn-secondary" onClick={() => handleOpenAuth('login')}>Login</button>
              <button className="btn btn-primary" onClick={() => handleOpenAuth('signup')}>Sign Up</button>
            </>
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
      
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        mode={authMode} 
        setMode={setAuthMode}
        onLogin={setUser}
      />
    </div>
    </Router>
  );
}

export default App;
