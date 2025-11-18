import React, { createContext, useContext, useState, useEffect } from 'react';

// Context toiri kora
const AuthContext = createContext(null);

// Nije-r hook toiri kora, jate shob jaygay use kora jay
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider component toiri kora
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // Page load howar shomoy check korbe

  // === API URL Setup (Automatic Switch) ===
  const apiUrl = import.meta.env.VITE_API_URL;

  // Page load howar shomoy check korbe user-er data localStorage-e ache kina
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false); // Check kora shesh
  }, []);

  // === SIGNUP Function ===
  const signup = async (name, email, password) => {
    // Shudhu signup korbe, auto-login korbe na
    const response = await fetch(`${apiUrl}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Signup failed');
    }
    
    // Signup successful
    return await response.json();
  };

  // === LOGIN Function ===
  const login = async (email, password) => {
    const response = await fetch(`${apiUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    const data = await response.json();

    // Data state-e save kora
    setCurrentUser(data.user);
    setToken(data.token);

    // Data localStorage-e save kora (jate refresh korleo login thake)
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('token', data.token);

    return data;
  };

  // === LOGOUT Function ===
  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  // Shob value children-der moddhe pass kora
  const value = {
    currentUser,
    token,
    login,
    signup,
    logout,
    loading, 
  };

  // Jodi loading hoy, tahole kichu dekhabena, jate app crash na kore
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};