import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom'; 
import BookCard from '../components/BookCard'; 
import './CategoryPage.css'; // Ensure this file exists

// === 1. IMAGES IMPORT ===
import religiousImg from '../assets/religious.jpg';   
import mysteryImg from '../assets/mystery thriller.jpg';       
import bengaliImg from '../assets/litrature.jpg'; 
import kidsImg from '../assets/kids.jpg';             
import engineeringImg from '../assets/engineering.jpg'; 
import fantasyImg from '../assets/puran.jpg';       
import scienceFictionImg from '../assets/main banner 3.jpg'; 
import defaultImg from '../assets/mystery thriller.jpg'; 

// === 2. IMAGE MAPPING (Must match Database Names) ===
const categoryBanners = {
  "Religious": religiousImg,
  "Mystery and Thriller": mysteryImg,  
  "kids": kidsImg,                     
  "Science": scienceFictionImg,        
  "Bengali Literature": bengaliImg,
  "Engineering": engineeringImg,
  "Fantasy": fantasyImg,             
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function CategoryPage() {
  const { categoryName } = useParams(); // URL slug

  const [books, setBooks] = useState([]);
  const [currentCategory, setCurrentCategory] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // A. Fetch Categories
        const catResponse = await fetch(`${API_URL}/api/categories`);
        const categories = await catResponse.json();

        // B. Match Category
        const matchedCategory = categories.find(cat => 
            cat.slug === categoryName || 
            cat.name.toLowerCase() === categoryName.toLowerCase()
        );

        if (!matchedCategory) {
          throw new Error('Category not found');
        }
        
        setCurrentCategory(matchedCategory); 

        // C. Fetch Books
        const bookResponse = await fetch(`${API_URL}/api/books`);
        const allBooks = await bookResponse.json();

        // D. Filter Books
        const filteredBooks = allBooks.filter(book => {
          if (!book.category) return false;
          const targetNameLower = matchedCategory.name.toLowerCase();
          const targetId = matchedCategory._id;

          if (typeof book.category === 'string') {
             return book.category.toLowerCase() === targetNameLower || book.category === targetId;
          }
          else if (typeof book.category === 'object') {
             return (book.category.name && book.category.name.toLowerCase() === targetNameLower) || 
                    (book.category._id && book.category._id === targetId);
          }
          return false;
        });

        setBooks(filteredBooks);

      } catch (err) {
        console.error("Error:", err);
        setError("Could not load books.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categoryName]);

  // === Helper: Get Banner Image ===
  const getBannerImage = (catName) => {
    if (!catName) return defaultImg;
    if (categoryBanners[catName]) return categoryBanners[catName];
    const key = Object.keys(categoryBanners).find(k => k.toLowerCase() === catName.toLowerCase());
    if (key) return categoryBanners[key];
    return defaultImg;
  };

  const bannerImage = currentCategory ? getBannerImage(currentCategory.name) : defaultImg;

  return (
    // === MAIN CONTAINER (Reset Padding/Margin) ===
    <div className="category-page-container" style={{
        width: '100%',
        maxWidth: '100%',
        padding: '0',
        margin: '0',
        overflowX: 'hidden'
    }}>
      
      {/* === FULL WIDTH BANNER === */}
      {!loading && currentCategory && (
        <div className="category-hero-banner" style={{
            width: '100vw', 
            height: '350px',   // 🚀 HEIGHT INCREASED HERE
            position: 'relative',
            left: '50%',
            right: '50%',
            marginLeft: '-50vw', 
            marginRight: '-50vw',
            marginTop: '-20px', // 🚀 NAVBAR GAP FIX (Adjust if needed)
            overflow: 'hidden'
        }}>
            <img 
                src={bannerImage} 
                alt={currentCategory.name} 
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: 'brightness(0.6)' 
                }} 
            />
            
            {/* Title Overlay */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                color: 'white',
                zIndex: 2,
                width: '90%'
            }}>
                <h1 style={{ 
                    fontSize: '4rem', 
                    margin: 0, 
                    fontWeight: 'bold', 
                    textTransform: 'uppercase', 
                    letterSpacing: '3px',
                    textShadow: '2px 2px 10px rgba(0,0,0,0.8)'
                }}>
                    {currentCategory.name}
                </h1>
                <p style={{ fontSize: '1.4rem', marginTop: '15px', color: '#f0f0f0' }}>
                    Explore our collection of {books.length} books
                </p>
            </div>
        </div>
      )}

      {loading && <div className="loading-spinner" style={{textAlign:'center', padding:'50px'}}>Loading...</div>}
      
      {/* === BOOKS SECTION (Centered) === */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
          
          {!loading && books.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: 'red' }}>
                <h3>No books found in this category yet.</h3>
                <Link to="/" style={{ color: 'blue', textDecoration: 'underline' }}>Go Home</Link>
            </div>
          )}
          
          {!loading && books.length > 0 && (
            <div className="book-list-container" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '25px',
            }}>
              {books.map(book => (
                <BookCard key={book._id} book={book} />
              ))}
            </div>
          )}
      </div>

    </div>
  );
}

export default CategoryPage;