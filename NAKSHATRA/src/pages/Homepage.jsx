import React, { useState, useEffect } from 'react';
// === 1. `useLocation` import korun ===
import { Link, useLocation } from 'react-router-dom';
import './HomePage.css'; 
import BookCard from '../components/BookCard'; 
import heroImage from '../assets/book hone.jpg'; 

function HomePage() {
  
  // === 2. State toiri kora ===
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]); // Category state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // === 3. URL theke search query neoa ===
  const location = useLocation();
  const searchQuery = new URLSearchParams(location.search).get('search');

  // === 4. Data Fetch Korar Jonno useEffect Update Kora ===
  useEffect(() => {
    const fetchBooksAndCategories = async () => {
      try {
        setLoading(true);
        setError(null);

        // --- Fetch Categories (Database theke) ---
        const catResponse = await fetch('http://localhost:5000/api/categories');
        if (!catResponse.ok) throw new Error('Failed to fetch categories');
        const catData = await catResponse.json();
        setCategories(catData);

        // --- Fetch Books (Search query shoho) ---
        let bookApiUrl = 'http://localhost:5000/api/books';
        if (searchQuery) {
          bookApiUrl += `?search=${searchQuery}`; // API URL-e search query add kora
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
  }, [searchQuery]); // [searchQuery] mane, jokhon-i URL-er search query change hobe, tokhon-i data abar fetch hobe

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