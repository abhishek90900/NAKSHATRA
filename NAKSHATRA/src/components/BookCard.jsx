import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './BookCard.css';

function BookCard({ book }) {
  const { currentUser, token } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // API URL সেট করা (Environment অনুযায়ী অটোমেটিক চেঞ্জ হবে)
  const apiUrl = import.meta.env.VITE_API_URL;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setMessage(null);

    // === 1. LOGIN CHECK ===
    if (!currentUser) {
      navigate('/login');
      return;
    }

    setIsLoading(true);
    try {
      // === 2. BACKEND REQUEST (Variable URL ব্যবহার করা হয়েছে) ===
      const response = await fetch(`${apiUrl}/api/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bookId: book._id, quantity: 1 })
      });

      if (!response.ok) {
        throw new Error('Failed to add to cart');
      }

      // === 3. SUCCESS ===
      setMessage('Added!');
      setTimeout(() => setMessage(null), 2000);

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
          <p className="card-price">₹{book.price}</p>
        </div>
      </Link>
      
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