const express = require('express');
const router = express.Router();
const Equipment = require('../models/equipment'); // Import Equipment model
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// Engineer Home Page
router.get('/', authenticate, authorize('Engineer'), async (req, res) => {
  try {
    const assignedEquipment = await Equipment.find({ assignedTo: req.user._id });
    res.render('engineer/home', {
      title: 'Engineer Dashboard',
      equipment: assignedEquipment, // Pass the fetched equipment
      user: req.user, // Pass user info
    });
  } catch (error) {
    console.error('Error fetching assigned equipment:', error.message);
    res.status(500).send('Error fetching assigned equipment.');
  }
});

router.get('/dashboard', authenticate, async (req, res) => {
  try {
    const assignedEquipment = await Equipment.find({ assignedTo: req.user._id });

    res.render('engineer/home', {
      title: 'Engineer Dashboard',
      equipment: assignedEquipment,
      user: req.user,
    });
  } catch (error) {
    console.error('Error fetching assigned equipment:', error.message);
    res.status(500).send({ message: 'Error fetching assigned equipment', error: error.message });
  }
});

module.exports = router;
