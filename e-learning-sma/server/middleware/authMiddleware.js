const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const authenticateToken = (req, res, next) => {
  console.log(`Auth middleware: ${req.method} ${req.url}`);
  console.log('Auth header:', req.headers['authorization'] ? 'Present' : 'Missing');

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('Auth middleware: No token provided');
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) {
      console.log('Auth middleware: Token verification failed:', err.message);
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    try {
      console.log('Auth middleware: Token decoded, userId:', decoded.userId);
      const user = await User.findById(decoded.userId);
      if (!user) {
        console.log('Auth middleware: User not found for ID:', decoded.userId);
        return res.status(403).json({ error: 'User not found' });
      }

      console.log('Auth middleware: User authenticated:', user.username, 'Role:', user.role);
      req.user = user;
      next();
    } catch (error) {
      console.log('Auth middleware: Database error:', error.message);
      res.status(500).json({ error: 'Server error' });
    }
  });
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    console.log(`Role authorization: ${req.method} ${req.url}`);
    console.log('Required roles:', roles);
    console.log('User role:', req.user ? req.user.role : 'No user');

    if (!req.user) {
      console.log('Role authorization: No user found');
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      console.log(`Role authorization: User role '${req.user.role}' not in required roles:`, roles);
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    console.log('Role authorization: Access granted');
    next();
  };
};

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) {
      return next();
    }

    try {
      const user = await User.findById(decoded.userId);
      if (user) {
        req.user = user;
      }
      next();
    } catch (error) {
      next();
    }
  });
};

module.exports = {
  authenticateToken,
  authorizeRoles,
  optionalAuth,
  JWT_SECRET
};
