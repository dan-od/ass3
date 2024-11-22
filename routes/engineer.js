const express = require('express');
const router = express.Router();
const Equipment = require('../models/equipment'); // Import Equipment model
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.get('/home', authenticate, authorize('Engineer'), (req, res) => {
    res.render('engineer/home', {
        title: 'Engineer Dashboard',
        user: req.user // Pass the authenticated user object
    });
});

// View Assigned Equipment
router.get('/assigned', authenticate, authorize('Engineer'), async (req, res) => {
    try {
        const assignedEquipment = await Equipment.find({ assignedTo: req.user._id });
        res.render('engineer/assignedEquipment', {
            title: 'Assigned Equipment',
            user: req.user, // Pass the authenticated user
            equipment: assignedEquipment // Pass the assigned equipment to the template
        });
    } catch (error) {
        console.error('Error fetching assigned equipment:', error.message);
        res.status(500).send('Error fetching assigned equipment.');
    }
});

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

module.exports = router;
