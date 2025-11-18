import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Coupon code is required'],
    unique: true,
    uppercase: true, // "diwali10" o "DIWALI10" jate eki hoy
    trim: true,
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'], // 10% off (percentage) naki 100 Taka off (fixed)
    required: true,
  },
  discountValue: {
    type: Number,
    required: [true, 'Discount value is required'],
  },
  isActive: {
    type: Boolean,
    default: true, // Coupon-ta on/off korar jonne
  },
  expiresAt: {
    type: Date, // Coupon-er meyad shesh howar date
  },
}, {
  timestamps: true // Kokhon toiri hoyechilo
});

const Coupon = mongoose.model('Coupon', couponSchema);

export default Coupon;