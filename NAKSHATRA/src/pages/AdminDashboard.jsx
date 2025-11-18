import React, { useState, useEffect , useMemo} from 'react';
import { useAuth } from '../context/AuthContext';
import './AdminDashboard.css'; 
import { Link } from 'react-router-dom';
import bookIllustration from '../assets/book-illustration.jpg';

// ===================================================================
// === Component 1: Content Jinis Add Korar Form-gulo ===
// ===================================================================
function AddContentForms({ token }) {
  // === Book Form State ===
  const [bookFormData, setBookFormData] = useState({ title: '', author: '', category: '', price: '', description: '' });
  const [coverImage, setCoverImage] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [bookSuccess, setBookSuccess] = useState(null);
  const [bookError, setBookError] = useState(null);

  // === Category Form State ===
  const [categories, setCategories] = useState([]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');
  const [catSuccess, setCatSuccess] = useState(null);
  const [catError, setCatError] = useState(null);

  // === Coupon Form State ===
  const [couponCode, setCouponCode] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState(0);
  const [couponSuccess, setCouponSuccess] = useState(null);
  const [couponError, setCouponError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/categories');
        const data = await response.json();
        setCategories(data);
      } catch (err) {
        console.error('Failed to fetch categories', err);
      }
    };
    fetchCategories();
  }, []);

  // --- Handle Korar Function-gulo ---
  
  const handleBookChange = (e) => {
    const { name, value } = e.target;
    setBookFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleBookSubmit = async (e) => {
    e.preventDefault();
    setBookError(null); setBookSuccess(null);
    if (!coverImage || !pdfFile || !bookFormData.category) {
      setBookError('Please fill all fields and select files.'); return;
    }
    const dataToUpload = new FormData();
    dataToUpload.append('title', bookFormData.title);
    dataToUpload.append('author', bookFormData.author);
    dataToUpload.append('category', bookFormData.category);
    dataToUpload.append('price', bookFormData.price);
    dataToUpload.append('description', bookFormData.description);
    dataToUpload.append('coverImage', coverImage);
    dataToUpload.append('pdfFile', pdfFile);

    try {
      const response = await fetch('http://localhost:5000/api/books/add', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: dataToUpload,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Something went wrong');
      setBookSuccess('Book added successfully!');
      setBookFormData({ title: '', author: '', category: '', price: '', description: '' });
      setCoverImage(null); setPdfFile(null);
      e.target.reset(); 
    } catch (err) {
      setBookError(err.message);
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setCatError(null); setCatSuccess(null);
    try {
      const response = await fetch('http://localhost:5000/api/categories/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: newCatName, slug: newCatSlug })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to add category');
      setCatSuccess(`Category "${data.name}" added!`);
      setNewCatName(''); setNewCatSlug('');
      setCategories([...categories, data]);
    } catch (err) {
      setCatError(err.message);
    }
  };
  
  const handleCouponSubmit = async (e) => {
    e.preventDefault();
    setCouponError(null); setCouponSuccess(null);
    try {
      const response = await fetch('http://localhost:5000/api/coupons/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ code: couponCode, discountType, discountValue })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to create coupon');
      setCouponSuccess(`Coupon "${data.coupon.code}" created!`);
      setCouponCode(''); setDiscountValue(0);
    } catch (err) {
      setCouponError(err.message);
    }
  };

  return (
    <div className="admin-content-section">
      
      {/* --- 🚀 Section 1: Notun Wrapper Div --- */}
      <div className="add-book-section">

        {/* === Apnar Original "Add New Book" Form === */}
        {/* Apnar pathano code-ti ekhanei ache */}
        <div className="form-container">
          <h2>Add New Book</h2>
          <form className="upload-form" onSubmit={handleBookSubmit}>
            {bookSuccess && <p className="form-message form-success">{bookSuccess}</p>}
            {bookError && <p className="form-message form-error">{bookError}</p>}
            <div className="form-group"><label>Book Title</label><input type="text" name="title" value={bookFormData.title} onChange={handleBookChange} required /></div>
            <div className="form-group"><label>Author</label><input type="text" name="author" value={bookFormData.author} onChange={handleBookChange} required /></div>
            <div className="form-group"><label>Category</label>
              <select name="category" value={bookFormData.category} onChange={handleBookChange} required>
                <option value="">Select a category</option>
                {categories.map((cat) => <option key={cat._id} value={cat.slug}>{cat.name}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Price (in ₹)</label><input type="number" name="price" value={bookFormData.price} onChange={handleBookChange} required /></div>
            <div className="form-group"><label>Description</label><textarea name="description" value={bookFormData.description} onChange={handleBookChange} required /></div>
            <div className="file-inputs">
              <div className="form-group"><label>Cover Image</label><input type="file" onChange={(e) => setCoverImage(e.target.files[0])} required /></div>
              <div className="form-group"><label>Book PDF File</label><input type="file" onChange={(e) => setPdfFile(e.target.files[0])} required /></div>
            </div>
            <button type="submit" className="upload-button">Add Book</button>
          </form>
        </div>
        {/* === Apnar Form-er Code Ekhane Shesh === */}


        {/* --- 🚀 Notun Image Section (Wrapper-er Bhitore) --- */}
        <div className="add-book-image">
          {/* 'bookIllustration' variable-ti apnar import theke ashbe */}
          <img src={bookIllustration} alt="Book Upload Illustration" />
          <p>Add new and exciting books to your digital bookstore!</p>
        </div>

      </div> {/* <-- .add-book-section wrapper-er shesh --> */}

      {/* === Apnar Original "Category" o "Coupon" Section === */}
      <hr className="divider" />
      <div className="admin-section-split">
        <div className="form-container">
          <h2>Add New Category</h2>
          <form className="category-form" onSubmit={handleCategorySubmit}>
            {catSuccess && <p className="form-message form-success">{catSuccess}</p>}
            {catError && <p className="form-message form-error">{catError}</p>}
            <div className="form-group"><label>Category Name</label>
              <input type="text" value={newCatName}
                onChange={(e) => {
                  setNewCatName(e.target.value);
                  setNewCatSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''));
                }} required />
            </div>
            <div className="form-group"><label>Category Slug</label>
              <input type="text" value={newCatSlug} onChange={(e) => setNewCatSlug(e.target.value)} required />
            </div>
            <button type="submit" className="upload-button small">Add Category</button>
          </form>
        </div>
        <div className="form-container">
          <h2>Create New Coupon</h2>
          <form className="category-form" onSubmit={handleCouponSubmit}>
            {couponSuccess && <p className="form-message form-success">{couponSuccess}</p>}
            {couponError && <p className="form-message form-error">{couponError}</p>}
            <div className="form-group"><label>Coupon Code</label>
              <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} required />
            </div>
            <div className="form-group"><label>Discount Type</label>
              <select value={discountType} onChange={(e) => setDiscountType(e.target.value)}>
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>
            <div className="form-group"><label>Value</label>
              <input type="number" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} required />
            </div>
            <button type="submit" className="upload-button small">Create Coupon</button>
          </form>
        </div>
      </div>
    </div>
  );
}



// ===================================================================
// === Component 2: Order-gulo Control Korar Page (CHAT & SEARCH UPDATED) ===
// ===================================================================
function ManageOrdersComponent({ token }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  // === 🚀 Notun state chat message-er jonno (Aponar code) ===
  const [chatMessage, setChatMessage] = useState(""); 
  
  // === 🚀 NOTUN: Search state add kora holo ===
  const [searchTerm, setSearchTerm] = useState("");

  const deliveryStatuses = ['Pending', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];
  const refundStatuses = ['None', 'Requested', 'Approved', 'Rejected', 'Processing', 'Refunded'];

  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/admin/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch orders');
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchAllOrders();
  }, [token]);

  const handleUpdateDelivery = async (orderId, deliveryStatus) => {
    try {
      await fetch(`http://localhost:5000/api/admin/update-status/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ deliveryStatus })
      });
      fetchAllOrders(); 
    } catch (err) { console.error(err); }
  };
  
  const handleUpdateRefund = async (orderId, itemId, refundStatus) => {
    try {
      await fetch(`http://localhost:5000/api/admin/update-refund/${orderId}/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ refundStatus })
      });
      fetchAllOrders(); 
    } catch (err) { console.error(err); }
  };

  // === 🚀 Notun Function Chat Pathanor Jonno (Aponar code) ===
  const handleSendChat = async (orderId) => {
    if (!chatMessage.trim()) return; 

    try {
      const response = await fetch(`http://localhost:5000/api/admin/order-chat/${orderId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: chatMessage, sender: 'admin' }) 
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      setChatMessage(""); 
      fetchAllOrders(); 
      
    } catch (err) {
      console.error("Failed to send chat message", err);
      alert(err.message); 
    }
  };
  
  // === 🚀 NOTUN: Order filter korar logic ===
  const filteredOrders = useMemo(() => {
    if (!searchTerm.trim()) {
      return orders; // Kichu search na korle shob order dekhabe
    }
    // Shudhu razorpayOrderId na, user email diye o search kora jabe
    return orders.filter(order =>
      order.razorpayOrderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.user && order.user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, orders]); // searchTerm ba orders bodla-le ei function abar cholbe

  if (loading) return <div className="admin-content-section"><p>Loading all orders...</p></div>;
  if (error) return <div className="admin-content-section"><p>Error: {error}</p></div>;

  return (
    <div className="admin-content-section">
      <h2>Manage All Orders</h2>
      
      {/* === 🚀 NOTUN: Search Bar UI === */}
      <div className="admin-search-bar-wrapper">
        <input
          type="text"
          placeholder="Search by Order ID or User Email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="admin-search-input"
        />
      </div>
      {/* === Search Bar Shesh === */}

      <div className="order-management-list">
        {/* === 🚀 UPDATED: 'orders.map' er bodole 'filteredOrders.map' === */}
        {filteredOrders.length > 0 ? (
          filteredOrders.map(order => (
            <div key={order._id} className="admin-order-card">
              <div className="admin-order-header" onClick={() => setExpandedOrderId(expandedOrderId === order._id ? null : order._id)}>
                <div><strong>Order ID:</strong> #{order.razorpayOrderId}</div>
                <div><strong>User:</strong> {order.user ? order.user.email : 'N/A'}</div>
                <div><strong>Total:</strong> ₹{order.totalAmount.toFixed(2)}</div>
                <div><strong>Status:</strong> 
                  <select 
                    value={order.deliveryStatus} 
                    onChange={(e) => handleUpdateDelivery(order._id, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="admin-select"
                  >
                    {deliveryStatuses.map(status => <option key={status} value={status}>{status}</option>)}
                  </select>
                </div>
                <span className="expand-arrow">{expandedOrderId === order._id ? '▲' : '▼'}</span>
              </div>
              
              {expandedOrderId === order._id && (
                <div className="admin-order-details">
                  <h4>Items:</h4>
                  {order.items.map(item => (
                    <div key={item._id} className="admin-item-row">
                      <img src={item.coverImageUrl} alt={item.title} />
                      <p>{item.title} (Qty: {item.quantity})</p>
                      <div className="refund-section">
                        <strong>Refund:</strong> 
                        <span className={`refund-status-admin status-${item.refundRequest.status.toLowerCase()}`}>
                          {item.refundRequest.status}
                        </span>
                        {item.refundRequest.status === 'Requested' && (
                          <p><strong>Reason:</strong> {item.refundRequest.reason}</p>
                        )}
                        <select 
                          value={item.refundRequest.status} 
                          onChange={(e) => handleUpdateRefund(order._id, item._id, e.target.value)}
                          onClick={(e) => e.stopPropagation()} 
                          className="admin-select"
                        >
                          {refundStatuses.map(status => <option key={status} value={status}>{status}</option>)}
                        </select>
                      </div>
                    </div>
                  ))}
                  <h4>Chat History:</h4>
                  <div className="admin-chat-history">
                    {order.chatHistory.length === 0 ? <p>No chat history.</p> :
                      order.chatHistory.map((chat, index) => (
                        <div key={index} className={`chat-bubble ${chat.sender}`}>
                          <p>{chat.message}</p>
                          <span className="chat-timestamp">{new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      ))
                    }
                  </div>

                  {/* === 🚀 Notun Chat Input Box (Aponar code) === */}
                  <div className="admin-chat-input-area">
                    <input 
                      type="text" 
                      placeholder="Type your message to the user..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onClick={(e) => e.stopPropagation()} 
                      onKeyPress={(e) => {
                        e.stopPropagation();
                        if (e.key === 'Enter') handleSendChat(order._id);
                      }}
                    />
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSendChat(order._id);
                      }}
                    >
                      Send
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="admin-no-orders-message">
            <p>{searchTerm ? `"${searchTerm}"-er jonno kono order pawa jayni.` : 'Kono order ekhono porjonto nei.'}</p>
          </div>
        )}
      </div>
    </div>
  );
}


// ===================================================================
// === Component 3: "Manage Users" Component ===
// ===================================================================
function ManageUsersComponent({ token }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/admin/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch users');
        setUsers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchUsers();
  }, [token]);

  const handleUserClick = async (userId) => {
    try {
      setSelectedUser(userId);
      setUserDetails(null);
      const response = await fetch(`http://localhost:5000/api/admin/user/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch user details');
      setUserDetails(data);
    } catch (err) {
      console.error(err);
    }
  };
  
  if (loading) return <div className="admin-content-section"><p>Loading users...</p></div>;

  return (
    <div className="admin-content-section">
      <h2>Manage Users</h2>
      <div className="manage-users-layout">
        <div className="user-list-column">
          <h3>All Users ({users.length})</h3>
          <div className="user-list">
            {users.map(user => (
              <button 
                key={user._id} 
                className={`user-list-item ${selectedUser === user._id ? 'active' : ''}`}
                onClick={() => handleUserClick(user._id)}
              >
                <p>{user.name} {user.role === 'admin' && '(Admin)'}</p>
                <span>{user.email}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="user-details-column">
          <h3>User Details</h3>
          {!selectedUser && <p>Select a user from the left to see their details.</p>}
          {selectedUser && !userDetails && <p>Loading user details...</p>}
          {userDetails && (
            <div className="user-details-content">
              <h4>Profile & Address</h4>
              <p><strong>Name:</strong> {userDetails.user.name}</p>
              <p><strong>Email:</strong> {userDetails.user.email}</p>
              <p><strong>Phone:</strong> {userDetails.user.phone || 'N/A'}</p>
              <p><strong>Address:</strong> 
                {userDetails.user.address ? 
                  `${userDetails.user.address.street}, ${userDetails.user.address.city}, ${userDetails.user.address.state} - ${userDetails.user.address.zipCode}`
                  : 'N/A'}
              </p>
              <hr className="divider" />
              <h4>Order History ({userDetails.orders.length})</h4>
              <div className="user-order-history">
                {userDetails.orders.length === 0 ? <p>This user has no orders.</p> :
                  userDetails.orders.map(order => (
                    <Link to={`/order/${order._id}`} key={order._id} className="user-order-link" target="_blank">
                      <p>Order #{order.razorpayOrderId} - <strong>₹{order.totalAmount.toFixed(2)}</strong></p>
                      <span>Status: {order.deliveryStatus}</span>
                    </Link>
                  ))
                }
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ===================================================================
// === MAIN ADMIN DASHBOARD (Notun Layout Shoho) ===
// ===================================================================
function AdminDashboard() {
  const { currentUser, token } = useAuth();
  const [activeView, setActiveView] = useState('manage-orders'); 

  // =======================================
  // === 🚀 FIX: লোডিং স্টেট চেক করা ===
  // =======================================
  // currentUser লোড না হওয়া পর্যন্ত অপেক্ষা করুন
  if (!currentUser) {
    // আপনি এখানে একটি লোডিং স্পিনার বা মেসেজ দেখাতে পারেন
    return <p style={{ textAlign: 'center', marginTop: '50px' }}>Loading Admin Panel...</p>;
  }

  // এখন currentUser লোড হয়ে গেছে, তাই 'role' চেক করা নিরাপদ
  if (currentUser.role !== 'admin') {
    return <p>You are not authorized to view this page.</p>; 
  }

  // =======================================
  // === END FIX ===
  // =======================================

  // যদি কোড এই পর্যন্ত আসে, তার মানে ইউজার লোড হয়েছে এবং সে অ্যাডমিন
  return (
    <div className="admin-panel-container">
      
      {/* === Bam Diker Sidebar === */}
      <div className="admin-sidebar">
        <div className="sidebar-user-info">
          <img src={`https://api.dicebear.com/8.x/initials/svg?seed=${currentUser.name}`} alt="avatar" />
          <h4>{currentUser.name}</h4>
          <p>Admin Panel</p>
        </div>
        <nav className="admin-sidebar-nav">
          <button 
            className={activeView === 'manage-orders' ? 'active' : ''}
            onClick={() => setActiveView('manage-orders')}
          >
            Manage Orders
          </button>
          <button 
            className={activeView === 'manage-users' ? 'active' : ''}
            onClick={() => setActiveView('manage-users')}
          >
            Manage Users
          </button>
          <button 
            className={activeView === 'add-content' ? 'active' : ''}
            onClick={() => setActiveView('add-content')}
          >
            Add Content
          </button>
        </nav>
      </div>

      {/* === Dan Diker Content Area === */}
      <div className="admin-content">
        {activeView === 'manage-orders' && <ManageOrdersComponent token={token} />}
        {activeView === 'manage-users' && <ManageUsersComponent token={token} />}
        {activeView === 'add-content' && <AddContentForms token={token} />}
      </div>
    </div>
  );
}

export default AdminDashboard;