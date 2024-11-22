const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Equipment = require('../models/equipment');
const User = require('../models/users'); // Import the User model
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// Protect all routes with authentication
router.use(authenticate);

// Route to view all equipment
router.get('/', authenticate, async (req, res) => {
    try {
        const equipment = await Equipment.find(); // Fetch all equipment
        res.render('equipment/index', {
            title: 'Equipment Inventory',
            equipment, // Pass equipment data
            user: req.user, // Pass the entire user object
            userRole: req.user.role, //  pass the user role
        });
    } catch (error) {
        console.error('Error rendering equipment page:', error.message);
        res.status(500).send('Error rendering equipment page');
    }
});


router.get('/view', authenticate, async (req, res) => {
  try {
    const equipment = await Equipment.find(); // Fetch all equipment
    res.render('equipment/index', { 
      title: 'Equipment Inventory',
      equipment, // Pass equipment data to the view
      user: req.user, 
      userRole: req.user.role, 
    });
  } catch (error) {
    console.error('Error fetching equipment:', error.message);
    res.status(500).send('Error fetching equipment');
  }
});
;



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
router.post('/add', authenticate, authorize(['Admin', 'Manager']), async (req, res) => {
    try {
        const { name, category, serialNumber, status, notes } = req.body;

        const newEquipment = new Equipment({
            name,
            category,
            serialNumber,
            status: status || 'Available', // Default to 'Available' if status is not provided
            notes,
            addedBy: req.user._id, // Log the user who added the equipment
            history: [
                {
                    action: 'Added',
                    performedBy: req.user.username, // Use username or other identifier
                    notes: 'Added by admin/manager',
                },
            ],
        });

        await newEquipment.save();
        res.redirect('/equipment');
    } catch (error) {
        console.error('Error adding equipment:', error.message);
        res.status(500).send({
            message: 'Error adding equipment',
            error: error.message,
        });
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

// Route to approve a request
router.post('/approve/:id', async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).send({ message: 'Request not found' });
    }

    request.status = 'Approved';
    await request.save();

    res.redirect('/requests'); // Redirect to requests list after approval
  } catch (error) {
    console.error('Error approving request:', error.message);
    res.status(500).send({ message: 'Error approving request', error: error.message });
  }
});

// Route to reject a request
router.post('/reject/:id', async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).send({ message: 'Request not found' });
    }

    request.status = 'Rejected';
    await request.save();

    res.redirect('/requests'); // Redirect to requests list after rejection
  } catch (error) {
    console.error('Error rejecting request:', error.message);
    res.status(500).send({ message: 'Error rejecting request', error: error.message });
  }
});


// Route to show equipment details
router.get('/details/:id', authenticate, async (req, res) => {
    try {
        const equipment = await Equipment.findById(req.params.id).populate('assignedTo');
        if (!equipment) {
            return res.status(404).send('Equipment not found');
        }
        res.render('equipment/details', {
            title: 'Equipment Details',
            equipment,
            user: req.user,
        });
    } catch (error) {
        console.error('Error fetching equipment details:', error.message);
        res.status(500).send('Error fetching equipment details');
    }
});

// Route to update equipment
router.get('/update/:id', async (req, res) => {
    try {
        const equipment = await Equipment.findById(req.params.id).populate('assignedTo');
        const engineers = await User.find({ role: 'Engineer' });

        if (!equipment) {
            return res.status(404).send('Equipment not found');
        }

        // Pass 'title' as part of the data sent to the view
        res.render('equipment/updateEquipment', {
            title: 'Update Equipment',
            equipment,
            engineers,
        });
    } catch (error) {
        console.error('Error fetching equipment for update:', error);
        res.status(500).send('Error fetching equipment');
    }
});


// Route to update equipment
router.post('/update/:id', async (req, res) => {
  try {
    const { assignedTo, status } = req.body;  // Extract status and assignedTo from the form input

    // Find the equipment by its ID
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      return res.status(404).send({ message: 'Equipment not found' });
    }

    // If an engineer is selected, ensure that the assignedTo field is set as an ObjectId
    if (assignedTo) {
      // Assign the ObjectId from the engineer selection
      equipment.assignedTo = mongoose.Types.ObjectId(assignedTo); // This will ensure the proper assignment
    }

    // Update the status of the equipment
    if (status) {
      equipment.status = status; // Update the status field
    }

    // Save the equipment with the updated fields
    await equipment.save();

    res.redirect('/equipment');  // Redirect to the equipment list page after updating
  } catch (error) {
    console.error('Error updating equipment:', error.message);
    res.status(500).send({ message: 'Error updating equipment', error: error.message });
  }
});



router.post('/delete/:id', async (req, res) => {
    try {
        const equipmentId = req.params.id;
        const equipment = await Equipment.findByIdAndDelete(equipmentId); // Delete the equipment by ID

        if (!equipment) {
            return res.status(404).send({ message: 'Equipment not found' });
        }

        res.redirect('/equipment'); // Redirect to equipment list page
    } catch (error) {
        console.error('Error deleting equipment:', error.message);
        res.status(500).send({ message: 'Error deleting equipment', error: error.message });
    }
});


module.exports = router;
