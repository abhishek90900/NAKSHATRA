// File: src/pages/CategoryPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // URL theke category name nite
import BookCard from '../components/BookCard'; // Ager BookCard-i bebohar korbo
import './CategoryPage.css'; // Notun CSS

function CategoryPage() {
  // URL theke categoryName pawa (e.g., "fiction")
  const { categoryName } = useParams(); 
  
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBooksByCategory = async () => {
      setLoading(true);
      setError(null);
      try {
        // Backend-er category route-ke call kora
        const response = await fetch(`http://localhost:5000/api/books/category/${categoryName}`);
        
        if (!response.ok) {
          throw new Error('No books found in this category');
        }
        const data = await response.json();
        setBooks(data);
      } catch (err) {
        setError(err.message);
        setBooks([]); // Error hole boi khali kora
      } finally {
        setLoading(false);
      }
    };

    fetchBooksByCategory();
  }, [categoryName]); // categoryName bodla-lei abar data fetch korbe

  return (
    <div className="category-page-container">
      <h1 className="category-page-title">{categoryName}</h1>

      {loading && <p className="category-loading">Loading books...</p>}
      
      {error && <p className="category-error" style={{color: 'red'}}>{error}</p>}
      
      {!loading && !error && (
        <div className="book-list-container">
          {books.map(book => (
            <BookCard key={book._id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}

export default CategoryPage;