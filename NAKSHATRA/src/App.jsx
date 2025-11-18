import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; // 🚀 IMPORT KORA HOLO

// Components
import Header from './components/Header';
import AdminRoute from './components/AdminRoute';

// Pages
import Homepage from './pages/HomePage'; // Note: File name might be HomePage.jsx
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AdminDashboard from './pages/AdminDashboard'; 
import CategoryPage from './pages/CategoryPage';
import BookDetailsPage from './pages/BookDetailsPage';
import CartPage from './pages/CartPage'; 
import ProfilePage from './pages/ProfilePage';
import OrderDetailsPage from './pages/OrderDetailsPage';

import './App.css'; // Jodi thake

function App() {
  return (
    // 🚀 AuthProvider দিয়ে পুরো অ্যাপ র‍্যাপ করা হলো
    // যাতে Header এবং সব পেজ লগইন ডাটা পায়
    <AuthProvider>
      <div className="App">
        <Header />
        <main> 
          <Routes>
            {/* --- Common Routes --- */}
            <Route path="/" element={<Homepage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            
            {/* --- Book & Category Routes --- */}
            <Route path="/category/:categoryName" element={<CategoryPage />} />
            <Route path="/book/:bookId" element={<BookDetailsPage />} />
            
            {/* --- User Specific Routes --- */}
            <Route path="/basket" element={<CartPage />} />
            <Route path="/account" element={<ProfilePage />} />
            <Route path="/order/:orderId" element={<OrderDetailsPage />} />
            
            {/* === ADMIN ROUTE === */}
            <Route path="/admin" element={<AdminRoute />}>
              <Route path="" element={<AdminDashboard />} /> 
            </Route>
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;