// File: src/pages/LoginPage.jsx

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './FormPage.css'; // <-- 1. CSS IMPORT KORA HOLO

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      // API theke error message nite gele (jodi thake)
      setError(err.response?.data?.message || err.message || 'Failed to log in');
    }
  };

  return (
    // 2. Center korar jonno wrapper add kora holo
    <div className="form-container-wrapper">
      <div className="form-container">
        <h2>Login</h2>

        {/* 3. Inline style shoriye form-er moddhe classname add kora holo */}
        <form onSubmit={handleSubmit}>

          {/* Error message-ta ekhane show korbe */}
          {error && <p className="form-error">{error}</p>}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="admin123"
              required
            />
          </div>

          <button type="submit" className="form-button">Login</button>

          <p className="form-footer-link">
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
export default LoginPage;