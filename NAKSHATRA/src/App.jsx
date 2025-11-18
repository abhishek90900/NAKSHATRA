import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Homepage from './pages/Homepage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AdminDashboard from './pages/AdminDashboard'; 
import AdminRoute from './components/AdminRoute';
import CategoryPage from './pages/CategoryPage';
import BookDetailsPage from './pages/BookDetailsPage';
import CartPage from './pages/CartPage'; 
import ProfilePage from './pages/ProfilePage';
import OrderDetailsPage from './pages/OrderDetailsPage';

function App() {
  return (
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
          
          {/* === ADMIN ROUTE (Updated) === */}
          <Route path="/admin" element={<AdminRoute />}>
            {/* path="" মানে হলো '/admin' পাথে গেলেই এটা লোড হবে।
              আপনার AdminDashboard কম্পোনেন্ট নিজেই ভেতরের কন্টেন্ট (orders, users, etc.)
              বদলানোর কাজটা করছে, তাই এখানে আর path="*" দরকার নেই।
            */}
            <Route path="" element={<AdminDashboard />} /> 
          </Route>
        </Routes>
      </main>
    </div>
  );
}

export default App;