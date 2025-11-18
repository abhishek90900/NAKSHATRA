import express from 'express';
import Cart from '../models/Cart.model.js';
import auth from '../middleware/auth.middleware.js'; // Amader "Security Guard"
import Book from '../models/Book.model.js'; // Book model import kora holo

const router = express.Router();

// === GET USER'S CART (Notun Route) ===
// URL: GET /api/cart
// Login kora user-er shob cart item details debe
router.get('/', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate({
      path: 'items.book',
      model: Book // Kon model theke details anbe sheta bole deoa holo
    });

    if (!cart) {
      return res.json({ items: [], subtotal: 0 }); // Khali cart pathano
    }

    // Daam calculate kora
    let subtotal = 0;
    cart.items.forEach(item => {
      if (item.book) { // Check korche boi-ta delete hoye jayni to
        subtotal += item.quantity * item.book.price;
      }
    });

    res.json({ items: cart.items, subtotal });

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});


// === ADD ITEM TO CART (Ager Route) ===
// URL: POST /api/cart/add
router.post('/add', auth, async (req, res) => {
  const { bookId, quantity = 1 } = req.body;
  const userId = req.user.id; 

  try {
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [{ book: bookId, quantity: quantity }]
      });
    } else {
      const itemIndex = cart.items.findIndex(item => item.book.toString() === bookId);
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push({ book: bookId, quantity: quantity });
      }
    }
    await cart.save();
    res.status(200).json({ message: 'Book added to cart' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// === REMOVE ITEM FROM CART (Notun Route) ===
// URL: DELETE /api/cart/remove/:bookId
router.delete('/remove/:bookId', auth, async (req, res) => {
  const { bookId } = req.params;
  const userId = req.user.id;

  try {
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Item-take cart theke filter kore baad deoa
    cart.items = cart.items.filter(item => item.book.toString() !== bookId);

    await cart.save();
    res.status(200).json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// === UPDATE ITEM QUANTITY (Notun Route) ===
// URL: PUT /api/cart/update
router.put('/update', auth, async (req, res) => {
  const { bookId, quantity } = req.body;
  const userId = req.user.id;

  if (quantity < 1) {
    return res.status(400).json({ message: 'Quantity must be at least 1' });
  }

  try {
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(item => item.book.toString() === bookId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = quantity;
      await cart.save();
      res.status(200).json({ message: 'Cart updated' });
    } else {
      res.status(404).json({ message: 'Item not found in cart' });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

export default router;