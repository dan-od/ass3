const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const Request = require('../models/request'); // Ensure you have a Request model

// Admin Home Page
router.get('/', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const requests = await Request.find({ status: 'Pending' }); // Fetch pending requests
    res.render('admin/home', { title: 'Admin Dashboard', user: req.user, requests });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading admin dashboard');
  }
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

// Approve Request
router.post('/approve/:id', authenticate, authorize('Admin'), async (req, res) => {
  try {
    await Request.findByIdAndUpdate(req.params.id, { status: 'Approved' });
    res.redirect('/admin');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error approving request');
  }
});

// Deny Request
router.post('/deny/:id', authenticate, authorize('Admin'), async (req, res) => {
  try {
    await Request.findByIdAndUpdate(req.params.id, { status: 'Denied' });
    res.redirect('/admin');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error denying request');
  }
});


module.exports = router;
