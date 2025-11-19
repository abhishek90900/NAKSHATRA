import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './HomePage.css'; 
import BookCard from '../components/BookCard'; 

// === Images Import ===
import heroImage1 from '../assets/main banner 1.jpg'; 
import heroImage2 from '../assets/main banner 2.png'; 
import heroImage3 from '../assets/main banner 3.jpg'; 

// Category Images 
import religiousImg from '../assets/religious.jpg';   
import mysteryImg from '../assets/mystery thriller.jpg';       
import bengaliImg from '../assets/litrature.jpg'; 
import kidsImg from '../assets/kids.jpg';             
import engineeringImg from '../assets/engineering.jpg'; 
import fantasyImg from '../assets/puran.jpg';       
import scienceFictionImg from '../assets/main banner 3.jpg'; 
// Default Image
import defaultImg from '../assets/mystery thriller.jpg'; 

// Hero Section Image Array
const heroImages = [heroImage1, heroImage2, heroImage3]; 

// === 🛠️ FIXED CONFIGURATION AREA 🛠️ ===
// Ekhon Database er namer sathe EXACT milano hoyeche
const categoryBanners = {
  "Religious": religiousImg,
  
  // Screenshot onujayi update kora holo:
  "Mystery and Thriller": mysteryImg,  // DB: "Mystery and Thriller"
  "kids": kidsImg,                     // DB: "kids" (Small letter)
  "Science": scienceFictionImg,        // DB: "Science"
  
  "Bengali Literature": bengaliImg,
  "Engineering": engineeringImg,
  "Fantasy": fantasyImg,             
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function HomePage() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const searchQuery = new URLSearchParams(location.search).get('search');

  const [currentHeroImageIndex, setCurrentHeroImageIndex] = useState(0);

  // Carousel Logic
  useEffect(() => {
    if (!searchQuery) { 
      const interval = setInterval(() => {
        setCurrentHeroImageIndex((prevIndex) => 
          (prevIndex + 1) % heroImages.length
        );
      }, 3000); 
      return () => clearInterval(interval); 
    }
  }, [searchQuery]); 

  // Data Fetching
  useEffect(() => {
    const fetchBooksAndCategories = async () => {
      try {
        setLoading(true);
        const catResponse = await fetch(`${API_URL}/api/categories`);
        const catData = await catResponse.json();
        setCategories(catData);

        let bookApiUrl = `${API_URL}/api/books`;
        if (searchQuery) bookApiUrl += `?search=${searchQuery}`;
        const bookResponse = await fetch(bookApiUrl);
        const bookData = await bookResponse.json();
        setBooks(bookData);

      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBooksAndCategories();
  }, [searchQuery]); 

  // Filter Logic
  const getBooksByCategory = (categoryId, categoryName) => {
    if (!Array.isArray(books)) return [];
    return books.filter(book => {
      if (!book.category) return false;
      const catNameLower = categoryName.toLowerCase();
      if (typeof book.category === 'string') {
        return book.category === String(categoryId) || book.category.toLowerCase() === catNameLower;
      }
      else if (typeof book.category === 'object') {
        return String(book.category._id) === String(categoryId) || (book.category.name && book.category.name.toLowerCase() === catNameLower);
      }
      return false;
    });
  };

  // === Helper to get Banner ===
  const getBannerImage = (catNameFromDB) => {
    // 1. Exact match check
    if (categoryBanners[catNameFromDB]) {
        return categoryBanners[catNameFromDB];
    }
    
    // 2. Case-insensitive match (Backup logic)
    // E.g. DB: "Religious", Config: "religious"
    const key = Object.keys(categoryBanners).find(
        k => k.toLowerCase() === catNameFromDB.toLowerCase()
    );
    if (key) return categoryBanners[key];

    // 3. Debugging (Ekhon match korbe, tai eta r dorkar hobe na)
    // console.log(`Mismatch! DB has: "${catNameFromDB}"`);
    
    // 4. Fallback
    return defaultImg;
  };

  return (
    <div className="homepage-container">
      

      {/* Hero Section */}
      {!searchQuery && (
        <section className="hero-section">
          <div className="hero-text">
            <h1 className="hero-title">Find Your Next Great Read</h1>
            <p className="hero-subtitle">Discover thousands of books.</p>
            <Link to="/collections" className="hero-button">All Books</Link>
          </div>
          <div className="hero-image">
            {/* KEY prop add kora hoyeche jate animation protibar kaj kore */}
            <img 
              key={currentHeroImageIndex} 
              src={heroImages[currentHeroImageIndex]} 
              alt="Book Banner" 
            />
          </div>
        </section>
      )}

      
      {loading && <div className="loading-spinner">Loading...</div>}
      
      {!loading && !error && (
        <>
          {searchQuery ? (
             <section className="featured-books-section">
                <h2>Search Results for "{searchQuery}"</h2>
                <div className="book-list-container">
                  {books.length > 0 ? (
                    books.map(book => <BookCard key={book._id} book={book} />)
                  ) : (
                    <p>No books found.</p>
                  )}
                </div>
             </section>
          ) : (
            <div className="all-categories-container">
              {categories.map((category) => {
                const categoryBooks = getBooksByCategory(category._id, category.name);
                const bannerImg = getBannerImage(category.name);

                return (
                  <section key={category._id} className="featured-books-section category-block" style={{marginTop:'40px'}}>
                    
                    <Link 
                      to={`/category/${category.slug}`} 
                      style={{ textDecoration: 'none', display: 'block' }}
                    >
                        <div className="category-banner-wrapper" style={{ 
                            width:'100%', 
                            height:'200px', 
                            overflow:'hidden', 
                            marginBottom:'20px', 
                            position:'relative', 
                            borderRadius: '8px',
                            cursor: 'pointer',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}>
                            <img src={bannerImg} alt={category.name} style={{width:'100%', height:'100%', objectFit:'cover'}} />
                            
                            <h2 style={{
                                position:'absolute', 
                                bottom:'15px', 
                                left:'20px', 
                                color:'white', 
                                background:'rgba(0,0,0,0.6)', 
                                padding:'8px 15px',
                                borderRadius: '4px',
                                margin: 0
                            }}>
                                {category.name}
                            </h2>
                        </div>
                    </Link>

                    <div className="book-list-container">
                      {categoryBooks.length > 0 ? (
                        categoryBooks.slice(0, 4).map(book => <BookCard key={book._id} book={book} />)
                      ) : (
                        <p style={{ color: '#666', fontStyle: 'italic', padding: '10px' }}>
                           No books available in this category yet.
                        </p>
                      )}
                    </div>
                  </section>
                );
              })}
            </div>
          )}

          {!searchQuery && ( 
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
        </>
      )}
    </div>
  );
}

export default HomePage;