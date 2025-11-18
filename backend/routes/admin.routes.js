import express from 'express';
import Order from '../models/Order.model.js';
import User from '../models/User.model.js'; // User model import kora
import auth from '../middleware/auth.middleware.js'; // Login check
import admin from '../middleware/admin.middleware.js'; // Admin check

const router = express.Router();

// Shob route-e age login check hobe, tarpor admin check hobe
router.use(auth, admin);

// === 1. GET ALL USERS (Notun Route) ===
// URL: GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// === 2. GET ALL DETAILS FOR A SINGLE USER (Notun Route) ===
// URL: GET /api/admin/user/:userId
router.get('/user/:userId', async (req, res) => {
  try {
    const [user, orders] = await Promise.all([
      User.findById(req.params.userId).select('-password'),
      Order.find({ user: req.params.userId }).sort({ createdAt: -1 })
    ]);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ user, orders }); // User-er details ebong tar shob order pathano
    
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// === 3. GET ALL ORDERS (Ager Motoi) ===
// URL: GET /api/admin/orders
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// === 4. UPDATE DELIVERY STATUS (Admin) ===
// URL: PUT /api/admin/update-status/:orderId
router.put('/update-status/:orderId', async (req, res) => {
  const { orderId } = req.params;
  const { deliveryStatus } = req.body;

  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.deliveryStatus = deliveryStatus;
    // Notun tracking log add kora
    order.trackingHistory.push({
      status: deliveryStatus,
      timestamp: new Date(),
      message: `Order status updated to ${deliveryStatus} by admin.`
    });
    
    await order.save();
    res.json({ message: 'Order status updated', order });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// === 5. UPDATE REFUND STATUS (Admin) ===
// URL: PUT /api/admin/update-refund/:orderId/:itemId
router.put('/update-refund/:orderId/:itemId', async (req, res) => {
  const { orderId, itemId } = req.params;
  const { refundStatus } = req.body;

  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const item = order.items.find(i => i._id.toString() === itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    item.refundRequest.status = refundStatus;
    
    // Notun tracking log add kora
    order.trackingHistory.push({
      status: `Refund ${refundStatus}`,
      timestamp: new Date(),
      message: `Refund status for ${item.title} updated to ${refundStatus}.`
    });

    await order.save();
    res.json({ message: 'Refund status updated', order });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// === 6. 🚀 NOTUN ADMIN CHAT ROUTE 🚀 ===
// URL: POST /api/admin/order-chat/:orderId
// Description: Admin ekta order-er bhetore notun chat message pathabe
router.post(
  '/order-chat/:orderId',
  // auth ebong admin middleware agei 'router.use()' diye check kora hoyeche
  async (req, res) => {
    try {
      const { orderId } = req.params;
      const { message, sender } = req.body; // sender: 'admin'

      // 1. Order-ta khuje ber korun
      const order = await Order.findById(orderId);

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      // 2. Notun chat object toiri korun
      const newChatMessage = {
        message: message,
        sender: sender, // 'admin'
        timestamp: new Date()
      };

      // 3. Order-er chatHistory array-te message-ta push korun
      order.chatHistory.push(newChatMessage);

      // 4. Order-ta database-e save korun
      await order.save();

      // 5. Success response pathan
      res.status(200).json({ 
        message: 'Chat message sent successfully', 
        chatHistory: order.chatHistory 
      });

    } catch (error) {
      console.error('Admin chat send error:', error);
      res.status(500).json({ message: 'Server error while sending chat.' });
    }
  }
);
// === Notun Chat Route Shesh ===

export default router;