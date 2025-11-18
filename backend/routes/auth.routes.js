import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';

const router = express.Router();

// === 1. USER SIGNUP (/api/auth/signup) ===
// (Eta eki ache, kono change nei)
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }
    user = new User({ name, email, password });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();
    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});


// === 2. USER LOGIN (/api/auth/login) ===
// (Ekhane PAYLOAD-take update kora hoyeche)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // === NOTUN UPDATE EKHANE ===
    // Ekhon payload-er moddhe ID ebong ROLE duto-i jachhe
    const payload = {
      user: {
        id: user.id,
        role: user.role // <-- JORURI UPDATE
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET, // Apnar .env file theke SECRET KEY nebe
      { expiresIn: '30d' },
      (err, token) => {
        if (err) throw err;
        
        // Frontend-e user data pathano (eta eki ache)
        res.json({
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        });
      }
    );
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

export default router;