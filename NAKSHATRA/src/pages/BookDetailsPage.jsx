// File: src/pages/BookDetailsPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './BookDetailsPage.css'; // CSS

function BookDetailsPage() {
  const { bookId } = useParams(); 
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://localhost:5000/api/books/${bookId}`);
        if (!response.ok) {
          throw new Error('Book not found');
        }
        const data = await response.json();
        setBook(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBookDetails();
  }, [bookId]);

  const handleBuyNow = () => {
    alert('Payment gateway ekhono add kora hoyni.');
  };

  if (loading) return <p className="details-loading">Loading book details...</p>;
  if (error) return <p className="details-error" style={{color: 'red'}}>{error}</p>;
  if (!book) return null;

  return (
    <div className="book-details-container">
      
      <div className="details-image-container">
        <img src={book.coverImageUrl} alt={book.title} className="details-image" />
      </div>

      <div className="details-content">
        <h1 className="details-title">{book.title}</h1>
        <p className="details-author">by {book.author}</p>
        <p className="details-price">${book.price}</p>
        <p className="details-description">{book.description}</p>
        
        <div className="details-actions">
          
          {/* Sorasori database theke paowa link bebohar kora hocche */}
          <a 
            href={book.pdfFileUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="action-button read-button"
          >
            Read PDF
          </a>
          
          <button onClick={handleBuyNow} className="action-button buy-button">
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default BookDetailsPage;