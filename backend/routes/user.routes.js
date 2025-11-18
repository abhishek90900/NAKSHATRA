import express from 'express';
import User from '../models/User.model.js';
import auth from '../middleware/auth.middleware.js'; // Login check

const router = express.Router();

// === 1. GET USER PROFILE DETAILS (Update Kora Holo) ===
// URL: GET /api/user/profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password'); 
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error(error.message);
    // === NOTUN JSON ERROR ===
    res.status(500).json({ message: 'Server Error while fetching profile' });
  }
});

// === 2. UPDATE USER PROFILE DETAILS (Update Kora Holo) ===
// URL: PUT /api/user/profile
router.put('/profile', auth, async (req, res) => {
  const { name, phone, address } = req.body;
  const userId = req.user.id;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          name: name,
          phone: phone,
          address: address,
        }
      },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ message: 'Profile updated successfully', user: updatedUser });
    
  } catch (error) {
    console.error(error.message);
    // === NOTUN JSON ERROR ===
    res.status(500).json({ message: 'Server Error while updating profile' });
  }
});

export default router;