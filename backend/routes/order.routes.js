import express from 'express';
import Order from '../models/Order.model.js';
import auth from '../middleware/auth.middleware.js'; // Login check

const router = express.Router();

// === 1. GET ALL MY ORDERS (Ager Motoi) ===
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    if (!orders) return res.json([]);
    res.json(orders);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error while fetching orders' });
  }
});

// === 2. GET A SINGLE ORDER BY ID (Ager Motoi) ===
router.get('/:orderId', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    res.json(order);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// === 3. NOTUN ROUTE: REQUEST REFUND FOR AN ITEM ===
// URL: PUT /api/orders/request-refund/:orderId/:itemId
router.put('/request-refund/:orderId/:itemId', auth, async (req, res) => {
  const { orderId, itemId } = req.params;
  const { reason } = req.body;

  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

    const item = order.items.find(i => i._id.toString() === itemId);
    if (!item) return res.status(404).json({ message: 'Item not found in order' });

    // Refund request update kora
    item.refundRequest.status = 'Requested';
    item.refundRequest.reason = reason;
    item.refundRequest.requestedAt = new Date();
    
    await order.save();
    res.json({ message: 'Refund request submitted successfully', order });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// === 4. NOTUN ROUTE: SEND CHAT MESSAGE (User) ===
// URL: POST /api/orders/add-chat/:orderId
router.post('/add-chat/:orderId', auth, async (req, res) => {
  const { orderId } = req.params;
  const { message } = req.body;

  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

    order.chatHistory.push({
      sender: 'user',
      message: message
    });
    
    await order.save();
    res.json({ message: 'Message sent', chatHistory: order.chatHistory });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;