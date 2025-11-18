import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

function AdminRoute() {
  // 'loading' ভ্যালুটি Context থেকে নিন
  const { currentUser, loading } = useAuth();

  // === ধাপ ১: চেক করুন সিস্টেম লোড হচ্ছে কিনা ===
  if (loading) {
    // লোড হওয়া পর্যন্ত অপেক্ষা করুন, কিছুই দেখাবেন না বা স্পিনার দেখান
    return <p style={{ textAlign: 'center', marginTop: '50px' }}>Authenticating...</p>;
  }

  // === ধাপ ২: লোডিং শেষ হলে, 'currentUser' চেক করুন ===
  if (currentUser && currentUser.role === 'admin') {
    // যদি ইউজার থাকে এবং সে অ্যাডমিন হয়, তবেই ড্যাশবোর্ড দেখান
    return <Outlet />;
  }

  // === ধাপ ৩: যদি লোডিং শেষ হয়, কিন্তু ইউজার অ্যাডমিন না হয় ===
  // তবে তাকে হোম পেজে পাঠিয়ে দিন
  return <Navigate to="/" replace />;
}
export default AdminRoute;