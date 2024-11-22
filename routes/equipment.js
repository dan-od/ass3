const express = require('express');
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
            userRole: req.user.role, // Optionally pass the user role
        });
    } catch (error) {
        console.error('Error rendering equipment page:', error.message);
        res.status(500).send('Error rendering equipment page');
    }
});


router.get('/view', authenticate, async (req, res) => {
    try {
        const requests = await Request.find().populate('requestedBy'); // Fetch requests
        const isAdmin = req.user.role === 'Admin';

        const processedRequests = requests.map((request) => ({
            ...request.toObject(),
            canApproveOrReject: isAdmin, // Add a flag for admin actions
        }));

        res.render('requests/viewRequests', {
            title: 'Equipment Requests',
            requests: processedRequests, // Send processed data
            userRole: req.user.role.toLowerCase(), // Pass user role in lowercase
        });
    } catch (error) {
        console.error('Error fetching requests:', error.message);
        res.status(500).send({
            message: 'Error fetching requests',
            error: error.message,
        });
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

// Approve Request
router.post('/approve/:id', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).send({ message: 'Request not found' });
    }
    request.status = 'Approved';
    request.updatedAt = Date.now();
    await request.save();

    res.redirect('/requests');
  } catch (error) {
    console.error('Error approving request:', error.message);
    res.status(500).send({ message: 'Error approving request', error: error.message });
  }
});

// Reject Request
router.post('/reject/:id', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const { reason } = req.body;

    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).send({ message: 'Request not found' });
    }
    request.status = 'Rejected';
    request.rejectionReason = reason;
    request.updatedAt = Date.now();
    await request.save();

    res.redirect('/requests');
  } catch (error) {
    console.error('Error rejecting request:', error.message);
    res.status(500).send({ message: 'Error rejecting request', error: error.message });
  }
});

module.exports = router;
