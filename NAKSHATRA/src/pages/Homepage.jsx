import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './HomePage.css'; 
import BookCard from '../components/BookCard'; 
import heroImage from '../assets/book hone.jpg'; 

// === 🚀 API URL SETUP (Automatic) ===
// VITE_API_URL environment variable theke link nibe
// Jodi .env file na thake, tobe default hisebe localhost nibe
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000' || 'https://nakshatra-sam5.onrender.com';

function HomePage() {
  
  // === State toiri kora ===
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // === URL theke search query neoa ===
  const location = useLocation();
  const searchQuery = new URLSearchParams(location.search).get('search');

  // === Data Fetch Korar Jonno useEffect ===
  useEffect(() => {
    const fetchBooksAndCategories = async () => {
      try {
        setLoading(true);
        setError(null);

        // --- Fetch Categories (Database theke) ---
        // 🚀 URL Updated
        const catResponse = await fetch(`${API_URL}/api/categories`);
        if (!catResponse.ok) throw new Error('Failed to fetch categories');
        const catData = await catResponse.json();
        setCategories(catData);

        // --- Fetch Books (Search query shoho) ---
        // 🚀 URL Updated
        let bookApiUrl = `${API_URL}/api/books`;
        if (searchQuery) {
          bookApiUrl += `?search=${searchQuery}`; 
        }
        
        const bookResponse = await fetch(bookApiUrl);
        if (!bookResponse.ok) throw new Error('Failed to fetch books');
        const bookData = await bookResponse.json();
        setBooks(bookData);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBooksAndCategories();
  }, [searchQuery]); 

  return (
    <div className="homepage-container">
      
      {/* --- Hero Section (Search na korle dekhabe) --- */}
      {!searchQuery && (
        <section className="hero-section">
          <div className="hero-text">
            <h1 className="hero-title">Find Your Next Great Read</h1>
            <p className="hero-subtitle">
              Discover thousands of books, from bestsellers to rare finds.
            </p>
            <Link to="/collections" className="hero-button">
              Browse All Books
            </Link>
          </div>
          <div className="hero-image">
            <img src={heroImage} alt="Book" />
          </div>
        </section>
      )}
      
      {/* ===== Books Section (Ekhon Search Result-o dekhabe) ===== */}
      <section className="featured-books-section">
        <h2 className="featured-books-title">
          {/* Search korle title change hobe */}
          {searchQuery ? `Search Results for "${searchQuery}"` : 'Featured Books'}
        </h2>
        
        {loading && <p className="no-books-message">Loading books...</p>}
        {error && <p className="no-books-message" style={{color: 'red'}}>{error}</p>}
        
        {!loading && !error && (
          <>
            {books.length === 0 ? (
              <p className="no-books-message">
                {searchQuery ? 'No books found matching your search.' : 'No books found.'}
              </p>
            ) : (
              <div className="book-list-container">
                {books.map(book => (
                  <BookCard key={book._id} book={book} />
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {/* --- Category Section (Ekhon Dynamic) --- */}
      {!searchQuery && ( // Search na korle category dekhabe
        <section className="category-section">
          <h2 className="category-title">Browse by Category</h2>
          <div className="category-grid">
            {categories.length > 0 ? (
              categories.map((category) => (
                <Link 
                  to={`/category/${category.slug}`} 
                  key={category._id} 
                  className="category-card"
                >
                  <h3>{category.name}</h3>
                </Link>
              ))
            ) : (
              <p>Loading categories...</p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

export default HomePage;