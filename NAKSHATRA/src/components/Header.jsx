import React, { useState, useEffect } from 'react';
import './Header.css'; 
import { FaSearch, FaShoppingCart, FaQuestionCircle, FaUser, FaSun, FaMoon } from 'react-icons/fa';
import { MdAccountCircle } from "react-icons/md";
import { Link, useNavigate } from 'react-router-dom'; 
import { useAuth } from '../context/AuthContext'; 
import logoImage from '../assets/logo.png'; 

function Header() {
  const { currentUser, logout } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate(); 

  const [theme, setTheme] = useState('light');
  useEffect(() => {
    document.body.classList.add(theme);
    return () => document.body.classList.remove(theme);
  }, [theme]);
  const handleThemeToggle = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault(); 
    if (searchTerm.trim()) {
      navigate(`/?search=${searchTerm}`);
      setSearchTerm(''); 
    } else {
      navigate('/'); 
    }
  };

  return (
    <header className="site-header">
      <div className="header-top">
        
        <div className="logo">
          <img src={logoImage} alt="Nakshatra Logo" className="logo-image" />
          <Link to="/">Nakshatra</Link>
        </div>

        {/* === Admin Link Update Kora Holo === */}
        <nav className="main-nav">
          <ul>
            {/* Shudhu Admin-ra ei link-ta dekhte pabe */}
            {currentUser && currentUser.role === 'admin' && (
              <li><Link to="/admin">Admin Panel</Link></li>
            )}
          </ul>
        </nav>
        
        <form className="search-bar" onSubmit={handleSearchSubmit}>
          <input 
            type="text" 
            placeholder="Search by title or author..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="search-button"><FaSearch /></button>
        </form>
        
        <nav className="user-nav">
          <button onClick={handleThemeToggle} className="theme-toggle-button">
            {theme === 'light' ? <FaMoon /> : <FaSun />}
          </button>
          
          {currentUser ? (
            <>
              <span>Hi, {currentUser.name} {currentUser.role === 'admin' && '(Admin)'}</span>
              <button onClick={logout} className="logout-button">Logout</button>
            </>
          ) : (
            <Link to="/login"><FaUser /> Sign in</Link>
          )}

          <Link to="/account"><MdAccountCircle /> My Account</Link>
          <Link to="/basket"><FaShoppingCart /> Basket</Link>
          <Link to="/help"><FaQuestionCircle /> Help</Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;