const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// Manager Home Page
router.get('/home', authenticate, authorize('Manager'), (req, res) => {
    if (!req.user) {
        return res.redirect('/users/login'); // Redirect to login if user is not authenticated
    }
    res.render('manager/home', { 
        title: 'Manager Dashboard', 
        user: req.user // Pass user object to EJS template
    });
});


router.get('/', authenticate, authorize('Manager'), (req, res) => {
  const user = req.user; // Get user object from request
  res.render('manager/home', { title: 'Manager Dashboard', user }); // Pass user to the EJS template
});

// Route to search engineers by name
router.get('/search-engineers', async (req, res) => {
  try {
    const { query } = req.query; // Get the search term from the query string
    const engineers = await User.find({
      role: 'Engineer',
      username: { $regex: query, $options: 'i' }, // Case-insensitive search
    }).select('username _id'); // Return only username and _id
    res.json(engineers); // Send matching engineers as JSON
  } catch (error) {
    console.error('Error searching engineers:', error.message);
    res.status(500).send({ message: 'Error fetching engineers' });
  }
});

module.exports = router;
