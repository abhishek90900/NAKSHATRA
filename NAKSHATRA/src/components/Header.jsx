import React, { useState, useEffect } from 'react';
import './Header.css'; 
import { FaSearch, FaShoppingCart, FaQuestionCircle, FaUser, FaSun, FaMoon, FaTimes } from 'react-icons/fa';
import { MdAccountCircle } from "react-icons/md";
import { Link, useNavigate } from 'react-router-dom'; 
import { useAuth } from '../context/AuthContext'; 
import logoImage from '../assets/logo.png'; 

// Search Modal Component
const SearchModal = ({ isOpen, onClose, initialSearchTerm, onSearchSubmit }) => {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);

  // Modal খোলা বা বন্ধ হলে body overflow নিয়ন্ত্রণ
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearchSubmit(searchTerm);
    onClose(); 
    setSearchTerm(''); // Search-এর পর ইনপুট ক্লিয়ার
  };

  if (!isOpen) return null;

  return (
    <div className="search-modal-overlay">
      <div className="search-modal-content">
        <form className="search-modal-bar" onSubmit={handleSubmit}>
          <input 
            type="text" 
            placeholder="Search by title or author..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus 
          />
          <button type="submit" className="search-modal-button">
            <FaSearch />
          </button>
        </form>
        <button onClick={onClose} className="search-modal-close-button">
          <FaTimes /> Close
        </button>
      </div>
    </div>
  );
};


function Header() {
  const { currentUser, logout } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false); // Modal state
  const navigate = useNavigate(); 

  const [theme, setTheme] = useState('light');
  useEffect(() => {
    // আগের theme রিমুভ করে নতুন theme অ্যাড
    document.body.classList.remove(theme === 'light' ? 'dark' : 'light');
    document.body.classList.add(theme);
  }, [theme]);
  const handleThemeToggle = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleSearchSubmit = (term) => {
    const finalTerm = (term || searchTerm).trim(); // Modal বা Regular Search
    if (finalTerm) {
      navigate(`/?search=${finalTerm}`);
    } else {
      navigate('/'); 
    }
    setSearchTerm(''); // Global state reset
  };
  
  // Regular search bar-এর জন্য
  const handleRegularSearchSubmit = (e) => {
      e.preventDefault(); 
      handleSearchSubmit(searchTerm);
  };

  return (
    <header className="site-header">
      <div className="header-top">
        
        <div className="logo">
          <img src={logoImage} alt="Nakshatra Logo" className="logo-image" />
          <Link to="/">Nakshatra</Link>
        </div>

        {/* === Admin Link === */}
        <nav className="main-nav">
          <ul>
            {currentUser && currentUser.role === 'admin' && (
              <li><Link to="/admin">Admin Panel</Link></li>
            )}
          </ul>
        </nav>
        
        {/* Desktop Search Bar (Mobile-এ Hide থাকবে) */}
        <form className="search-bar desktop-search" onSubmit={handleRegularSearchSubmit}>
          <input 
            type="text" 
            placeholder="Search by title or author..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="search-button"><FaSearch /></button>
        </form>
        
        <nav className="user-nav">
          {/* Mobile Search Icon */}
          <button 
            onClick={() => setIsSearchModalOpen(true)} 
            className="mobile-search-icon search-button"
            aria-label="Search"
          >
            <FaSearch />
          </button>
          
          <button onClick={handleThemeToggle} className="theme-toggle-button">
            {theme === 'light' ? <FaMoon /> : <FaSun />}
          </button>
          
          {currentUser ? (
            <>
              <span>Hi, {currentUser.name} {currentUser.role === 'admin' && '(Admin)'}</span>
              {/* Desktop-এ visible, Mobile-এ hidden by CSS */}
              <button onClick={logout} className="logout-button desktop-logout">Logout</button>
            </>
          ) : (
            <Link to="/login"><FaUser /> Sign in</Link>
          )}

          <Link to="/account"><MdAccountCircle /> My Account</Link>
          <Link to="/basket"><FaShoppingCart /> Basket</Link>
          <Link to="/help" className="desktop-help"><FaQuestionCircle /> Help</Link> {/* Mobile-এ এই লিংক হাইড করা যেতে পারে */}
        </nav>
      </div>

      {/* Search Modal */}
      <SearchModal 
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        initialSearchTerm={searchTerm}
        onSearchSubmit={handleSearchSubmit}
      />
    </header>
  );
}

export default Header;
