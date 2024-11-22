const jwt = require('jsonwebtoken');
const User = require('../models/users'); // Ensure correct path

module.exports = async (req, res, next) => {
    const token = req.cookies.authToken;

    if (!token) {
        return res.redirect('/users/login'); // Redirect to login if no token is provided
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.redirect('/users/login'); // Redirect if user not found
        }

        console.log('Authenticated User:', user); // Debug log
        req.user = user; // Attach user to the request object
        next(); // Proceed to the next middleware/route
    } catch (error) {
        console.error('Authentication error:', error.message);
        res.redirect('/users/login'); // Redirect if token verification fails
    }
};
