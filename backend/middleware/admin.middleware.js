import auth from './auth.middleware.js';

// Ei middleware-ta 2-to jinis check korbe:
// 1. User login kina (auth middleware-er kaaj)
// 2. User-er role "admin" kina

const admin = (req, res, next) => {
  // 1. Prothome check kora user login kina
  auth(req, res, () => {
    // 2. Jodi login thake, ebar check kora she 'admin' kina
    // req.user-ta amader token theke ashche (jetake amra ekhuni update korlam)
    if (req.user.role === 'admin') {
      next(); // Shob thik ache, porer kaj-e jao (e.g., coupon toiri koro)
    } else {
      // Login kora, kintu 'admin' noy
      res.status(403).json({ message: 'Access denied. Not an admin.' });
    }
  });
};

export default admin;