import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import './CartPage.css';
import logoImage from '../assets/logo.png'; // Logo import kora holo

function CartPage() {
  const { currentUser, token } = useAuth();
  const navigate = useNavigate();
  
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [discountDetails, setDiscountDetails] = useState(null);
  const [couponMessage, setCouponMessage] = useState(null);

  // === Cart-er data fetch kora ===
  const fetchCart = async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/cart', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch cart');
      const data = await response.json();
      setCartItems(data.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [token]);

  // === Item Remove / Quantity Change ===
  const handleRemoveItem = async (bookId) => {
    try {
      await fetch(`http://localhost:5000/api/cart/remove/${bookId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchCart();
    } catch (err) { console.error(err); }
  };
  const handleQuantityChange = async (bookId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(bookId);
      return;
    }
    try {
      await fetch('http://localhost:5000/api/cart/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ bookId, quantity: newQuantity })
      });
      fetchCart();
    } catch (err) { console.error(err); }
  };
  
  // === Coupon Apply ===
  const handleApplyCoupon = async () => {
    setCouponMessage(null);
    setDiscountDetails(null);
    try {
      const response = await fetch('http://localhost:5000/api/coupons/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ code: couponCode })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Invalid coupon');
      setDiscountDetails({ type: data.discountType, value: data.discountValue });
      setCouponMessage({ type: 'success', text: data.message });
    } catch (err) {
      setCouponMessage({ type: 'error', text: err.message });
    }
  };

  // === Total Price Calculation ===
  const subtotal = cartItems.reduce((acc, item) => {
    return acc + (item.book ? item.book.price * item.quantity : 0);
  }, 0);
  let totalDiscount = 0;
  if (discountDetails) {
    if (discountDetails.type === 'percentage') {
      totalDiscount = subtotal * (discountDetails.value / 100);
    } else if (discountDetails.type === 'fixed') {
      totalDiscount = discountDetails.value;
    }
  }
  if (totalDiscount > subtotal) totalDiscount = subtotal;
  const totalPrice = subtotal - totalDiscount;

  
  // === NOTUN PAYMENT FUNCTION (RAZORPAY) - UPDATE KORA HOLO ===
  const handleCheckout = async () => {
    try {
      // 1. Backend-ke bola ekta order toiri korte
      const orderResponse = await fetch('http://localhost:5000/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount: totalPrice.toFixed(2) })
      });
      
      // === NOTUN ERROR CHECK ===
      // Ekhon JSON error porte parbe
      const orderData = await orderResponse.json(); // Prothome JSON porte cheshta kora
      if (!orderResponse.ok) {
        throw new Error(orderData.message || 'Failed to create order');
      }
      
      // 2. Razorpay popup-er jonne options toiri kora
      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: "INR",
        name: "Nakshatra Book Store",
        description: "Test Book Payment",
        image: logoImage,
        order_id: orderData.orderId,
        
        // 3. Payment successful hole ei function-ta cholbe
        handler: async function (response) {
          try {
            // 4. Backend-ke bola payment-ta verify korte
            const verifyResponse = await fetch('http://localhost:5000/api/payment/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              })
            });

            // === NOTUN ERROR CHECK ===
            const verifyData = await verifyResponse.json();
            if (!verifyResponse.ok) {
              throw new Error(verifyData.message || 'Payment verification failed');
            }
            
            // 5. Shob successful!
            alert('Payment Successful! Your order has been placed.');
            navigate('/'); // Home page-e pathiye deoa
            
          } catch (verifyErr) {
            console.error(verifyErr);
            alert(`Error after payment: ${verifyErr.message}`);
          }
        },
        prefill: {
          name: currentUser.name,
          email: currentUser.email,
        },
        theme: {
          color: "#5d4037" // Apnar theme colour
        }
      };

      // 6. Razorpay popup open kora
      const razor = new window.Razorpay(options);
      razor.open();

    } catch (err) {
      console.error(err);
      // === NOTUN ALERT ===
      // Ekhon shothik error-ta dekhabe
      alert(`Error starting payment: ${err.message}`);
    }
  };


  if (loading) return <div className="cart-container"><p>Loading your basket...</p></div>;
  if (error) return <div className="cart-container"><p>Error: {error}</p></div>;

  return (
    <div className="cart-container">
      <h1>My Basket</h1>
      
      {cartItems.length === 0 ? (
        <div className="cart-empty">
          <p>Your basket is empty.</p>
          <Link to="/" className="cart-page-button">Start Shopping</Link>
        </div>
      ) : (
        <div className="cart-layout">
          
          <div className="cart-items-list">
            {cartItems.map(({ book, quantity }) => (
              book ? (
                <div key={book._id} className="cart-item">
                  <img src={book.coverImageUrl} alt={book.title} className="cart-item-image" />
                  <div className="cart-item-details">
                    <h3 className="cart-item-title">{book.title}</h3>
                    <p className="cart-item-author">by {book.author}</p>
                    <h4 className="cart-item-price">₹{book.price}</h4>
                  </div>
                  <div className="cart-item-actions">
                    <div className="quantity-selector">
                      <button onClick={() => handleQuantityChange(book._id, quantity - 1)}>-</button>
                      <span>{quantity}</span>
                      <button onClick={() => handleQuantityChange(book._id, quantity + 1)}>+</button>
                    </div>
                    <button onClick={() => handleRemoveItem(book._id)} className="remove-button">Remove</button>
                  </div>
                </div>
              ) : null
            ))}
          </div>

          <div className="cart-summary">
            <h3>Price Details</h3>
            <div className="coupon-section">
              <label htmlFor="coupon">Have a Coupon Code?</label>
              <div className="coupon-input">
                <input 
                  type="text" 
                  id="coupon"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                />
                <button onClick={handleApplyCoupon}>Apply</button>
              </div>
              {couponMessage && (
                <p className={`coupon-message ${couponMessage.type}`}>
                  {couponMessage.text}
                </p>
              )}
            </div>
            <div className="price-breakdown">
              <div className="price-line">
                <span>Price ({cartItems.length} items)</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="price-line discount">
                <span>Discount</span>
                <span>- ₹{totalDiscount.toFixed(2)}</span>
              </div>
              <div className="price-line total">
                <span>Total Amount</span>
                <span>₹{totalPrice.toFixed(2)}</span>
              </div>
            </div>
            
            <button 
              onClick={handleCheckout} 
              className="cart-page-button checkout-button"
              disabled={totalPrice <= 0} 
            >
              {totalPrice <= 0 ? 'Amount must be > ₹0' : 'Proceed to Checkout'}
            </button>
          </div>

        </div>
      )}
    </div>
  );
}

export default CartPage;