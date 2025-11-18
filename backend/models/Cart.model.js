import mongoose from 'mongoose';
const { Schema } = mongoose;

const cartItemSchema = new Schema({
  book: {
    type: Schema.Types.ObjectId,
    ref: 'Book', // Book.model.js theke ashbe
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  }
});

const cartSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User', // User.model.js theke ashbe
    required: true,
    unique: true // Ekjon user-er ektai cart thakbe
  },
  items: [cartItemSchema] // Cart-er bhetore onek boi thakte pare
}, {
  timestamps: true
});

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;