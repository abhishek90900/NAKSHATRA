import express from 'express';
import Category from '../models/Category.model.js';

const router = express.Router();

// GET ALL CATEGORIES
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({});
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// ADD A NEW CATEGORY
router.post('/add', async (req, res) => {
  const { name, slug } = req.body;
  if (!name || !slug) {
    return res.status(400).json({ message: 'Please provide name and slug' });
  }
  try {
    const categoryExists = await Category.findOne({ slug });
    if (categoryExists) {
      return res.status(400).json({ message: 'Category slug already exists' });
    }
    const newCategory = new Category({ name, slug });
    const createdCategory = await newCategory.save();
    res.status(201).json(createdCategory);
  } catch (error) {
    res.status(500).json({ message: 'Server error while adding category' });
  }
});

export default router;