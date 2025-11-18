import express from 'express';
import Coupon from '../models/Coupon.model.js';
import auth from '../middleware/auth.middleware.js'; // Login check
import admin from '../middleware/admin.middleware.js'; // Admin check

const router = express.Router();

// === 1. CREATE A NEW COUPON (Shudhu Admin-ra parbe) ===
// URL: POST /api/coupons/add
router.post('/add', auth, admin, async (req, res) => {
  const { code, discountType, discountValue, expiresAt } = req.body;

  try {
    // Check kora code-ta already use hoyeche kina
    let coupon = await Coupon.findOne({ code });
    if (coupon) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }

    coupon = new Coupon({
      code,
      discountType,
      discountValue,
      expiresAt,
    });

    await coupon.save();
    res.status(201).json({ message: 'Coupon created successfully', coupon });

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// === 2. GET ALL COUPONS (Shudhu Admin-ra parbe) ===
// URL: GET /api/coupons
router.get('/', auth, admin, async (req, res) => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 }); // Notun-gulo age dekhabe
    res.json(coupons);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// === 3. APPLY A COUPON (Shob Login kora User-ra parbe) ===
// URL: POST /api/coupons/apply
router.post('/apply', auth, async (req, res) => {
  const { code } = req.body;

  try {
    const coupon = await Coupon.findOne({
      code: code.toUpperCase(), // User choto-boro ja-i lekhuk
      isActive: true, // Coupon-ta "on" thakte hobe
    });

    if (!coupon) {
      return res.status(400).json({ message: 'Invalid coupon code' });
    }
    
    // Check kora coupon-er meyad (expiry date) ache kina
    if (coupon.expiresAt && coupon.expiresAt < Date.now()) {
      return res.status(400).json({ message: 'This coupon has expired' });
    }

    // Shob thik thakle, coupon-er details pathano
    res.json({
      message: 'Coupon applied successfully!',
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

export default router;