module.exports = (req, res, next) => {
    if (req.user) {
        res.locals.user = req.user; // Pass user object to all views
    } else {
        res.locals.user = null; // Ensure user is always defined
    }
    next(); // Move to the next middleware
};
