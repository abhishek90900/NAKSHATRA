import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import auth from '../middleware/auth.middleware.js';
import Cart from '../models/Cart.model.js';
import Order from '../models/Order.model.js';
import User from '../models/User.model.js'; 

// === DOTENV CONFIGURATION ===
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') }); 
// ===========================================

const router = express.Router();
let razorpay;

try {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
} catch(err) {
  console.error("RAZORPAY INITIALIZATION FAILED:", err.message);
}


// === CREATE A NEW ORDER (Ager Motoi) ===
router.post('/create-order', auth, async (req, res) => {
  const { amount } = req.body;
  try {
    if (!razorpay) throw new Error('Razorpay is not initialized. Check server .env file.');
    const amountInPaise = Math.round(Number(amount) * 100); 
    if (amountInPaise <= 0) return res.status(400).json({ message: 'Amount must be greater than 0' });
    
    const receiptId = `nakshatra_rcpt_${crypto.randomBytes(10).toString('hex')}`;
    const options = { amount: amountInPaise, currency: "INR", receipt: receiptId };
    
    const order = await razorpay.orders.create(options);
    res.json({ orderId: order.id, amount: order.amount, key_id: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    console.error("CREATE ORDER FAILED (Full Error):", error); 
    if (error.statusCode) return res.status(error.statusCode).json({ message: error.error.description });
    if (error.message) return res.status(500).json({ message: error.message });
    res.status(500).json({ message: 'An unknown server error occurred' });
  }
});

// === VERIFY THE PAYMENT (Smart Delivery Date Add Kora Holo) ===
router.post('/verify-payment', auth, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const userId = req.user.id;

  try {
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed. Invalid signature.' });
    }
    
    console.log("Payment signature verified. Fetching cart and user details...");

    const [cart, user] = await Promise.all([
      Cart.findOne({ user: userId }).populate('items.book'),
      User.findById(userId).select('address phone')
    ]);
    
    if (!cart || cart.items.length === 0) return res.status(400).json({ message: 'Cart is empty.' });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    // === NOTUN DELIVERY DATE LOGIC ===
    const userState = user.address ? user.address.state.toLowerCase() : '';
    const deliveryDays = (userState === 'west bengal') ? 3 : 7; // WB-te 3 din, onno jaygay 7 din
    const estimatedDeliveryDate = new Date();
    estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + deliveryDays);
    // =================================

    const totalAmount = cart.items.reduce((acc, item) => acc + (item.book.price * item.quantity), 0);

    const orderItems = cart.items.map(item => ({
      book: item.book._id,
      title: item.book.title,
      coverImageUrl: item.book.coverImageUrl,
      quantity: item.quantity,
      price: item.book.price,
      refundStatus: 'None' // Default value
    }));
    
    const newOrder = new Order({
      user: userId,
      items: orderItems,
      totalAmount: totalAmount,
      razorpayPaymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      paymentStatus: 'success',
      deliveryStatus: 'Pending',
      estimatedDeliveryDate: estimatedDeliveryDate, // Notun date save kora
      trackingHistory: [ // Prothom history log
        { status: 'Pending', timestamp: new Date(), message: 'Your order has been placed successfully.' }
      ],
      shipping_street: user.address ? user.address.street : '',
      shipping_city: user.address ? user.address.city : '',
      shipping_state: user.address ? user.address.state : '',
      shipping_zipCode: user.address ? user.address.zipCode : '',
      shipping_phone: user.phone ? user.phone : ''
    });

    console.log("Order object created. Attempting to save...");
    await newOrder.save();
    console.log("Order saved successfully! Clearing cart...");

    await Cart.findOneAndDelete({ user: userId }); 

    res.json({ message: 'Payment successful and order saved!', orderId: newOrder._id });

  } catch (error) {
    console.error("!!! CRITICAL: FAILED TO SAVE ORDER !!!", error);
    res.status(500).json({ message: 'Payment was successful, but failed to save your order. Please contact support.' });
  }
});

export default router;