const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.cookies.authToken;

  if (!token) {
    return res.status(401).send({ message: 'Unauthorized: No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach the decoded user data to the request
    next();
  } catch (err) {
    console.error('Authentication error:', err);
    return res.status(401).send({ message: 'Unauthorized: Invalid token' });
  }
};
