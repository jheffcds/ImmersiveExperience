const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Grab token after 'Bearer '


  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log('Authenticated user:', req.user);
    console.log('Token payload:', decoded);
    console.log('Token issued at:', new Date(decoded.iat * 1000).toLocaleString());
    console.log('Token expires at:', new Date(decoded.exp * 1000).toLocaleString());
    console.log('Token issued by:', decoded.iss);
    console.log('Token audience:', decoded.aud);
    console.log('Token subject:', decoded.sub);
    console.log('Token issued for user ID:', decoded.userId);
    console.log('Token user role:', decoded.role);
    console.log('Token user name:', decoded.name);
    console.log('Token issued at (UTC):', new Date(decoded.iat * 1000).toISOString());
    console.log('Token expires at (UTC):', new Date(decoded.exp * 1000).toISOString());
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
