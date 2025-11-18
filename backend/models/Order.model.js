import mongoose from 'mongoose';
const { Schema } = mongoose;

// Notun: Prottek-ta boi-er jonne alada schema
const orderItemSchema = new Schema({
  book: { type: Schema.Types.ObjectId, ref: 'Book' },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  title: { type: String },
  coverImageUrl: { type: String },
  // === NOTUN REFUND FIELD ===
  refundRequest: {
    status: {
      type: String,
      enum: ['None', 'Requested', 'Approved', 'Rejected', 'Processing', 'Refunded'],
      default: 'None'
    },
    reason: { type: String, default: '' },
    requestedAt: { type: Date }
  }
});

const orderSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [orderItemSchema], // Ekhon notun schema use korbe
  totalAmount: {
    type: Number,
    required: true,
  },
  razorpayPaymentId: { type: String },
  razorpayOrderId: { type: String },
  paymentStatus: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'pending',
  },
  deliveryStatus: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'],
    default: 'Pending',
  },
  estimatedDeliveryDate: { type: Date },
  
  // === NOTUN CHAT HISTORY ===
  chatHistory: [
    {
      sender: { type: String, enum: ['user', 'admin'] },
      message: { type: String },
      timestamp: { type: Date, default: Date.now }
    }
  ],
  
  // Address fields
  shipping_street: { type: String },
  shipping_city: { type: String },
  shipping_state: { type: String },
  shipping_zipCode: { type: String },
  shipping_phone: { type: String }
  
}, {
  timestamps: true 
});

const Order = mongoose.model('Order', orderSchema);

export default Order;