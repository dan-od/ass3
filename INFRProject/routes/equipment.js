const express = require('express');
const router = express.Router();
const Equipment = require('../models/equipment');
const User = require('../models/users'); // Import the User model
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// Protect all routes with authentication
router.use(authenticate);

// Route to view all equipment
router.get('/', async (req, res) => {
  try {
    const equipment = await Equipment.find(); // Fetch all equipment
    res.render('equipment/index', { 
      title: 'Equipment Inventory', 
      equipment,
      user: req.user // Pass the user object if you want role-based actions
    });
  } catch (error) {
    console.error('Error fetching equipment:', error.message);
    res.status(500).send({ message: 'Error fetching equipment', error: error.message });
  }
});

router.get('/check', authenticate, async (req, res) => {
  try {
    const equipment = await Equipment.find();
    if (!equipment || equipment.length === 0) {
      return res.status(404).send({ message: 'No equipment found in the inventory.' });
    }

    // Render index.ejs and pass the user object
    res.render('equipment/index', {
      title: 'Equipment Inventory',
      equipment,
      user: req.user, // Pass the authenticated user object
    });
  } catch (error) {
    console.error('Error fetching equipment:', error.message);
    res.status(500).send({ message: 'Error fetching inventory', error: error.message });
  }
});

// Route to render Add Equipment page
router.get('/add', authenticate, authorize(['Admin', 'Manager']), async (req, res) => {
  try {
    // Fetch all engineers from the database
    const engineers = await User.find({ role: 'Engineer' }).select('_id username');
    res.render('equipment/add', { title: 'Add New Equipment', user: req.user, engineers });
  } catch (error) {
    console.error('Error fetching engineers:', error.message);
    res.status(500).send({ message: 'Error loading form', error: error.message });
  }
});

router.post('/add', authenticate, authorize(['Admin', 'Manager']), async (req, res) => {
  try {
    const { name, category, serialNumber, status, locationType, assignTo, notes } = req.body;

    const newEquipment = new Equipment({
      name,
      category,
      serialNumber,
      status: status || 'Available',
      locationType,
      assignedTo: assignTo || null, // Assign to the selected engineer
      notes,
    });

    if (assignTo) {
      // Add assignment history
      newEquipment.history.push({
        action: 'Assigned',
        performedBy: req.user.username,
        assignedTo: assignTo,
        notes: 'Assigned during creation.',
      });
    }

    await newEquipment.save();
    res.redirect('/equipment'); // Redirect to the equipment list
  } catch (error) {
    console.error('Error adding equipment:', error.message);
    res.status(500).send({ message: 'Error adding equipment', error: error.message });
  }
});


// Route to handle Add Equipment form submission
router.post('/add', authenticate, authorize('Manager'), async (req, res) => {
  try {
    const { name, category, status, assignedTo, notes } = req.body;

    const newEquipment = new Equipment({
      name,
      category,
      status: assignedTo ? 'Assigned' : 'Available',
      assignedTo: assignedTo || null,
      notes,
      history: [
        {
          action: assignedTo ? 'Assigned' : 'Added to Inventory',
          performedBy: req.user.username,
          notes,
        },
      ],
    });

    await newEquipment.save();
    res.redirect('/equipment'); // Redirect to the equipment inventory list
  } catch (error) {
    console.error('Error adding equipment:', error.message);
    res.status(500).send('Error adding equipment.');
  }
});


router.post('/assign', async (req, res) => {
  try {
    const { engineerId, equipmentId } = req.body;

    // Find the equipment
    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) {
      return res.status(404).send({ message: 'Equipment not found.' });
    }

    // Assign the equipment
    equipment.status = 'Assigned';
    equipment.assignedTo = engineerId;
    equipment.history.push({
      action: 'Assigned',
      performedBy: 'Manager/Admin',
      assignedTo: engineerId,
    });
    await equipment.save();

    res.redirect('/equipment/check'); // Redirect back to equipment list
  } catch (error) {
    console.error('Error assigning equipment:', error.message);
    res.status(500).send({ message: 'Error assigning equipment', error: error.message });
  }
});

module.exports = router;
