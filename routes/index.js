const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// Role-Based Homepages
router.get('/admin/home', authenticate, authorize('admin'), (req, res) => {
    res.render('admin/home', { title: 'Admin Dashboard', user: req.user });
});

router.get('/manager/home', authenticate, authorize('manager'), (req, res) => {
    res.render('manager/home', { title: 'Manager Dashboard', user: req.user });
});

router.get('/engineer/home', authenticate, authorize('engineer'), (req, res) => {
    res.render('engineer/home', { title: 'Engineer Dashboard', user: req.user });
});

// Fallback for unauthorized access
router.get('/unauthorized', (req, res) => {
    res.status(403).render('unauthorized', { title: 'Unauthorized' });
});

module.exports = router;

// Example for Requests page:
router.get('/requests', (req, res) => {
  try {
    res.render('requests', { title: 'Requests' }); // Make sure 'requests.ejs' exists in 'views' folder
  } catch (error) {
    console.error('Error rendering requests page:', error);
    res.status(500).send({ message: 'Error rendering requests page', error });
  }
});

router.get('/redirect-dashboard', authenticate, (req, res) => {
    // Determine the dashboard URL based on the user's role
    if (req.user.role === 'Admin') {
        return res.redirect('/admin/home');
    } else if (req.user.role === 'Manager') {
        return res.redirect('/manager/home');
    } else if (req.user.role === 'Engineer') {
        return res.redirect('/engineer/home');
    }

    // Default fallback (e.g., for unexpected roles)
    return res.redirect('/');
});

// Export Router
module.exports = router;
