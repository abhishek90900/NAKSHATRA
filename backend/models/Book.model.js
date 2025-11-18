// File: backend/models/Book.model.js
import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    coverImageUrl: { type: String, required: true },
    
    // === NOTUN FIELD ADD KORA HOLO ===
    // PDF file-er URL save korar jonno
    pdfFileUrl: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const Book = mongoose.model('Book', bookSchema);
export default Book;