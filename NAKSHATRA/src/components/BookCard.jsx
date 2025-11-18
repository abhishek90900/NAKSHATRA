import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Login system import kora
import './BookCard.css'; // Apnar CSS file

function BookCard({ book }) {
  const { currentUser, token } = useAuth(); // Login kora user-er info nilam
  const navigate = useNavigate(); // Page change koranor jonne
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleAddToCart = async (e) => {
    e.preventDefault(); // Link-e click kora bondho korbe
    e.stopPropagation(); // Parent link-e jete badha debe
    setMessage(null);

    // === 1. LOGIN CHECK ===
    if (!currentUser) {
      // Jodi login kora na thake, Login page-e pathiye deoa
      navigate('/login');
      return; // Kaj bondho
    }

    // Jodi login kora thake:
    setIsLoading(true);
    try {
      // === 2. BACKEND-E REQUEST PATHANO ===
      const response = await fetch('http://localhost:5000/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Amader "Security Guard"-ke chabi deoa
        },
        body: JSON.stringify({ bookId: book._id, quantity: 1 })
      });

      if (!response.ok) {
        throw new Error('Failed to add to cart');
      }

      // === 3. SUCCESS ===
      setMessage('Added!');
      setTimeout(() => setMessage(null), 2000); // 2 sec por message chole jabe

    } catch (err) {
      setMessage('Error!');
      setTimeout(() => setMessage(null), 2000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="book-card">
      <Link to={`/book/${book._id}`} className="book-card-link-wrapper">
        <div className="card-image-container">
          <img 
            src={book.coverImageUrl || 'https://placehold.co/300x450/efebe9/5d4037?text=No+Image'} 
            alt={book.title} 
            className="card-image" 
          />
        </div>
        <div className="card-content">
          <h3 className="card-title">{book.title}</h3>
          <p className="card-author">by {book.author}</p>
          <p className="card-price">₹{book.price}</p> {/* <-- RUPEE SYMBOL (₹) KORA HOLO */}
        </div>
      </Link>
      
      {/* === NOTUN "ADD TO CART" BUTTON === */}
      <div className="card-button-container">
        <button 
          onClick={handleAddToCart} 
          disabled={isLoading}
          className="book-card-button"
        >
          {isLoading ? 'Adding...' : (message ? message : 'Add to Cart')}
        </button>
      </div>
    </div>
  );
}

export default BookCard;