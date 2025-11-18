import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './OrderDetailsPage.css';

// === Notun Animated Delivery Tracker ===
const DeliveryTracker = ({ status, estimatedDate }) => {
  const deliverySteps = ['Pending', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];
  const currentStepIndex = deliverySteps.indexOf(status);

  // === "INVALID DATE" BUG FIX ===
  const formatDate = (dateString) => {
    // Check kora date-ta valid kina
    if (!dateString || new Date(dateString).toString() === 'Invalid Date') {
      return "TBA"; // "To Be Announced"
    }
    return new Date(dateString).toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <div className="tracking-wrapper">
      <div className="delivery-tracker-animated">
        {deliverySteps.map((step, index) => (
          <div 
            key={step}
            className={`track-step ${index <= currentStepIndex ? 'completed' : ''} ${index === currentStepIndex ? 'current' : ''}`}
          >
            <div className="track-dot"></div>
            <p className="track-label">{step}</p>
          </div>
        ))}
        <div className="track-line-animated">
          <div className="track-line-progress" style={{ width: `${(currentStepIndex / (deliverySteps.length - 1)) * 100}%` }}></div>
        </div>
      </div>
      <p className="delivery-estimate">
        Estimated Delivery by {formatDate(estimatedDate)}
      </p>
    </div>
  );
};

// === Notun Refund Modal ===
const RefundModal = ({ item, orderId, token, onClose, onRefundRequested }) => {
  const [reason, setReason] = useState('Wrong item delivered');
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    try {
      const response = await fetch(`http://localhost:5000/api/orders/request-refund/${orderId}/${item._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to submit request');
      
      setMessage({ type: 'success', text: 'Refund request submitted!' });
      onRefundRequested(data.order); // Order-er state update kora
      setTimeout(onClose, 2000); // 2 sec por modal bondho kora
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={onClose} className="modal-close-button">&times;</button>
        <h3>Request Refund/Replacement</h3>
        <p>For item: <strong>{item.title}</strong></p>
        {message && <p className={`form-message form-${message.type}`}>{message.text}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="reason">Reason for request:</label>
            <select id="reason" value={reason} onChange={(e) => setReason(e.target.value)}>
              <option value="Wrong item delivered">Wrong item delivered</option>
              <option value="Damaged item received">Damaged item received</option>
              <option value="Item not as described">Item not as described</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <button type="submit" className="refund-submit-button">Submit Request</button>
        </form>
      </div>
    </div>
  );
};

// === Notun Chat Modal ===
const ChatModal = ({ orderId, chatHistory, token, onClose, onChatSent }) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    try {
      const response = await fetch(`http://localhost:5000/api/orders/add-chat/${orderId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ message })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to send message');
      onChatSent(data.chatHistory); // Chat history update kora
      setMessage(''); // Input clear kora
    } catch (err) {
      console.error(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content chat-modal">
        <button onClick={onClose} className="modal-close-button">&times;</button>
        <h3>Need Help? (Order #{orderId.slice(-6)})</h3>
        <div className="chat-history">
          {chatHistory.length === 0 && <p>Chat with our support team regarding this order.</p>}
          {chatHistory.map((chat, index) => (
            <div key={index} className={`chat-bubble ${chat.sender}`}>
              <p>{chat.message}</p>
              <span>{new Date(chat.timestamp).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
        <form className="chat-input-form" onSubmit={handleSubmit}>
          <input 
            type="text" 
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button type="submit" disabled={sending}>Send</button>
        </form>
      </div>
    </div>
  );
};

// === Main Order Details Page (Notun Layout Shoho) ===
function OrderDetailsPage() {
  const { orderId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refundItem, setRefundItem] = useState(null); 
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch order details');
        setOrder(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetails();
  }, [orderId, token, navigate]);

  if (loading) return <div className="order-details-container"><p>Loading order details...</p></div>;
  if (error) return <div className="order-details-container"><p>Error: {error}</p></div>;
  if (!order) return <div className="order-details-container"><p>Order not found.</p></div>;

  return (
    <div className="order-details-container">
      {refundItem && (
        <RefundModal 
          item={refundItem} 
          orderId={order._id}
          token={token}
          onClose={() => setRefundItem(null)}
          onRefundRequested={(updatedOrder) => setOrder(updatedOrder)}
        />
      )}
      {showChat && (
        <ChatModal 
          orderId={order._id}
          chatHistory={order.chatHistory}
          token={token}
          onClose={() => setShowChat(false)}
          onChatSent={(newHistory) => setOrder(prev => ({...prev, chatHistory: newHistory}))}
        />
      )}

      <Link to="/account" className="back-link">&lt; Back to My Orders</Link>
      <h1>Order Details</h1>
      
      <div className="order-details-header">
        <p>Order ID: #{order.razorpayOrderId}</p>
        <p>Placed on: {new Date(order.createdAt).toLocaleDateString()}</p>
      </div>

      <div className="order-tracking-section">
        <DeliveryTracker status={order.deliveryStatus} estimatedDate={order.estimatedDeliveryDate} />
      </div>

      {/* === NOTUN LAYOUT (Apnar Request Moto) === */}
      <div className="order-details-layout">
        
        {/* === BAM DIKE (Items) === */}
        <div className="order-items-column">
          <h3>Items in this Order</h3>
          {order.items.map(item => (
            <div key={item._id} className="order-book-item-details">
              <img src={item.coverImageUrl || 'https://placehold.co/100x150'} alt={item.title} />
              <div className="order-book-info">
                <Link to={`/book/${item.book}`}>{item.title}</Link>
                <p>Qty: {item.quantity}</p>
                <p>Price: ₹{item.price.toFixed(2)}</p>
                {item.refundRequest.status !== 'None' && (
                  <p className="refund-status">Refund Status: <strong>{item.refundRequest.status}</strong></p>
                )}
              </div>
              <div className="order-book-actions">
                <button 
                  className="refund-button"
                  onClick={() => setRefundItem(item)}
                  disabled={item.refundRequest.status !== 'None'}
                >
                  {item.refundRequest.status !== 'None' ? 'Refund Requested' : 'Request Refund'}
                </button>
                <button 
                  className="help-button"
                  onClick={() => setShowChat(true)}
                >
                  Need Help?
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* === DAN DIKE (Address & Price) === */}
        <div className="order-summary-column">
          <h3>Price Summary</h3>
          <div className="price-box">
            <div className="price-line">
              <span>Total MRP</span>
              <span>₹{order.totalAmount.toFixed(2)}</span>
            </div>
            <div className="price-line discount">
              <span>Discount</span>
              <span>- ₹0.00</span>
            </div>
            <div className="price-line total">
              <span>Total Amount Paid</span>
              <span>₹{order.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <h3>Delivery Address</h3>
          <div className="address-box">
            <p className="address-name">{order.shipping_phone}</p>
            <p>{order.shipping_street}</p>
            <p>{order.shipping_city}, {order.shipping_state} - {order.shipping_zipCode}</p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default OrderDetailsPage;