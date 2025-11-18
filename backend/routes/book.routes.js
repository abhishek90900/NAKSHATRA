import express from 'express';
import Book from '../models/Book.model.js';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

const router = express.Router();

// Multer o Cloudinary setup (Eki ache)
const storage = multer.memoryStorage();
const upload = multer({ storage ,
limits: { fileSize: 50 * 1024 * 1024 }});

const uploadToCloudinary = (fileBuffer, options) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

// POST /api/books/add (Eki ache)
router.post(
  '/add',
  upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'pdfFile', maxCount: 1 }
  ]),
  async (req, res) => {
    const { title, author, category, price, description } = req.body;
    if (!req.files || !req.files.coverImage || !req.files.pdfFile) {
      return res.status(400).json({ message: 'Please upload both cover image and PDF file.' });
    }
    try {
      const coverImageResult = await uploadToCloudinary(
        req.files.coverImage[0].buffer,
        { resource_type: 'image', folder: 'book-covers' }
      );
      const pdfOriginalName = req.files.pdfFile[0].originalname;
      const pdfFileResult = await uploadToCloudinary(
        req.files.pdfFile[0].buffer,
        {
          resource_type: 'raw',
          folder: 'book-pdfs',
          public_id: pdfOriginalName,
          overwrite: true
        }
      );
      const newBook = new Book({
        title, author, category, description,
        price: Number(price),
        coverImageUrl: coverImageResult.secure_url,
        pdfFileUrl: pdfFileResult.secure_url 
      });
      const createdBook = await newBook.save();
      res.status(201).json({ message: 'Book added successfully!', book: createdBook });
    } catch (error) {
      console.error('UPLOAD ERROR:', error);
      res.status(500).json({ message: 'Server error while uploading book', error: error.message });
    }
  }
);

// ===============================================
// GET /api/books (NOTUN SEARCH LOGIC EKHANE)
// ===============================================
router.get('/', async (req, res) => {
  // Ei line-ta URL theke search query nebe (jemon: ?search=bookname)
  const searchQuery = req.query.search; 

  try {
    let query = {}; // Khali query

    if (searchQuery) {
      // Jodi search query thake, tahole title ebong author-e khujbe
      query = {
        $or: [
          { title: { $regex: searchQuery, $options: 'i' } }, // 'i' = case-insensitive
          { author: { $regex: searchQuery, $options: 'i' } }
        ]
      };
    }
    
    // Jodi 'searchQuery' na thake, tahole query hobe {} (khali), mane shob boi ashbe
    const books = await Book.find(query);
    res.json(books);

  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// GET /api/books/:id (Eki ache)
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json(book);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// GET /api/books/category/:categoryName (Eki ache)
router.get('/category/:categoryName', async (req, res) => {
  try {
    const { categoryName } = req.params;
    const books = await Book.find({ category: categoryName });
    if (books.length === 0) return res.status(404).json({ message: 'No books found in this category' });
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching books by category' });
  }
});

export default router;