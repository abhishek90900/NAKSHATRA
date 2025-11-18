import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
  // Header theke token-ta ber kora
  const authHeader = req.header('Authorization');

  // Check kora token ache kina
  if (!authHeader) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Token-ta "Bearer <token>" ei format-e thake
    const token = authHeader.split(' ')[1];
    
    // Token-ta thik kina check kora
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // === EKHANE SHOMADHAN (THE FIX) ===
    // Age amra req.user = decoded.user pathachhilam
    // Ekhon amra shorashori decoded user object-takei req.user bolchi
    // Ebong nishchit korchi req.user.id-te shothik ID-ta ache
    req.user = decoded.user;
    // =================================
    
    next(); // Porer kaj-e age baro

  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

export default auth;