import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './ProfilePage.css'; // Amra ei CSS file-takeo update korbo

// === 1. "My Details" Component (Ager motoi) ===
function ProfileDetails({ token }) {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '',
    address: { street: '', city: '', state: '', zipCode: '' }
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true); setMessage(null);
        const response = await fetch('http://localhost:5000/api/user/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch profile');
        setFormData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || { street: '', city: '', state: '', zipCode: '' },
        });
      } catch (err) {
        setMessage({ type: 'error', text: err.message });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      address: { ...prev.address, [name]: value }
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    try {
      const { name, phone, address } = formData;
      const response = await fetch('http://localhost:5000/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name, phone, address })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update profile');
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  if (loading) return <p>Loading details...</p>;
  return (
    <div className="profile-content-section">
      <h2>Personal Information & Address</h2>
      <form className="profile-form" onSubmit={handleSubmit}>
        {message && <p className={`form-message form-${message.type}`}>{message.text}</p>}
        <h3>My Details</h3>
        <div className="form-row">
          <div className="form-group"><label>Full Name</label><input type="text" name="name" value={formData.name} onChange={handleChange} /></div>
          <div className="form-group"><label>Email</label><input type="email" name="email" value={formData.email} disabled /></div>
        </div>
        <div className="form-group"><label>Phone</label><input type="tel" name="phone" value={formData.phone} onChange={handleChange} /></div>
        <hr className="divider" />
        <h3>Delivery Address</h3>
        <div className="form-group"><label>Street</label><input type="text" name="street" value={formData.address.street} onChange={handleAddressChange} /></div>
        <div className="form-row">
          <div className="form-group"><label>City</label><input type="text" name="city" value={formData.address.city} onChange={handleAddressChange} /></div>
          <div className="form-group"><label>State</label><input type="text" name="state" value={formData.address.state} onChange={handleAddressChange} /></div>
        </div>
        <div className="form-group"><label>Zip Code</label><input type="text" name="zipCode" value={formData.address.zipCode} onChange={handleAddressChange} /></div>
        <button type="submit" className="profile-save-button">Save Changes</button>
      </form>
    </div>
  );
}

// === 2. "My Orders" Component (Notun Flipkart List Layout) ===
function MyOrders({ orders, loading }) {
  if (loading) return <p>Loading orders...</p>;
  if (orders.length === 0) return <p>You have not placed any orders yet.</p>;

  return (
    <div className="profile-content-section">
      <h2>My Orders</h2>
      <div className="order-list-simple">
        {orders.map(order => (
          // Ekhon prottek-ta order ekta link hobe notun OrderDetailsPage-er jonne
          <Link to={`/order/${order._id}`} key={order._id} className="order-summary-card">
            <div className="order-summary-image">
              <img 
                src={order.items[0]?.coverImageUrl || 'https://placehold.co/100x150'} 
                alt={order.items[0]?.title}
              />
            </div>
            <div className="order-summary-details">
              <span className={`order-status-badge status-${order.deliveryStatus.toLowerCase().replace(' ', '-')}`}>
                {order.deliveryStatus}
              </span>
              <p className="order-summary-title">
                {order.items.length === 1 ? order.items[0].title : `${order.items.length} Books`}
              </p>
              <p className="order-summary-date">
                Order placed on {new Date(order.createdAt).toLocaleDateString()}
              </p>
              {order.deliveryStatus === 'Delivered' ? (
                <p className="order-summary-delivery">Delivered on {new Date(order.estimatedDeliveryDate).toLocaleDateString()}</p>
              ) : (
                <p className="order-summary-delivery">Estimated Delivery by {new Date(order.estimatedDeliveryDate).toLocaleDateString()}</p>
              )}
            </div>
            <div className="order-summary-arrow">
              &gt;
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// === 3. Main Profile Page (Ager motoi) ===
function ProfilePage() {
  const { currentUser, token, logout } = useAuth();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('profile'); 
  const [orders, setOrders] = useState([]);
  const [orderLoading, setOrderLoading] = useState(true);

  if (!currentUser) {
    navigate('/login');
    return null; 
  }
  
  const handleFetchOrders = async () => {
    try {
      setOrderLoading(true);
      const response = await fetch('http://localhost:5000/api/orders/my-orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch orders');
      setOrders(data);
    } catch (err) {
      console.error(err.message);
      setOrders([]);
    } finally {
      setOrderLoading(false);
    }
  };
  
  // Jokhon page load hobe, tokhon-i jeno "My Profile" load hoy
  useEffect(() => {
    if (activeView === 'profile') {
      // ProfileDetails component nijei nijer data fetch korche
    } else if (activeView === 'orders') {
      handleFetchOrders();
    }
  }, [activeView, token]); // activeView change holei data fetch hobe

  return (
    <div className="profile-page-container">
      <h1>My Account</h1>
      <div className="profile-layout">
        <div className="profile-sidebar">
          <div className="sidebar-user-info">
            <img src={`https://api.dicebear.com/8.x/initials/svg?seed=${currentUser.name}`} alt="avatar" />
            <h4>{currentUser.name}</h4>
            <p>{currentUser.email}</p>
          </div>
          <nav className="profile-sidebar-nav">
            <button 
              className={activeView === 'profile' ? 'active' : ''}
              onClick={() => setActiveView('profile')}
            >
              My Profile & Address
            </button>
            <button 
              className={activeView === 'orders' ? 'active' : ''}
              onClick={() => {
                setActiveView('orders');
                handleFetchOrders(); // Click korle fetch korbe
              }}
            >
              My Orders
            </button>
            <button onClick={logout} className="logout-button">
              Logout
            </button>
          </nav>
        </div>
        <div className="profile-content">
          {activeView === 'profile' && <ProfileDetails token={token} />}
          {activeView === 'orders' && <MyOrders orders={orders} loading={orderLoading} />}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;