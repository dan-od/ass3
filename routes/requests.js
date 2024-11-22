const express = require('express');
const router = express.Router();
const Request = require('../models/request');
const Equipment = require('../models/equipment'); 
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// Route to view all requests
// Route to view all requests
router.get('/view', authenticate, async (req, res) => {
    try {
        const requests = await Request.find().populate('requestedBy'); // Fetch requests
        const isAdmin = req.user.role === 'Admin';

        // Define the route for the dashboard based on the user's role
        const processedRequests = requests.map((request) => ({
            ...request.toObject(),
            canApproveOrReject: isAdmin, // Add a flag for admin actions
        }));

        res.render('requests/viewRequests', {
            title: 'Equipment Requests',
            requests: processedRequests, // Send processed data
            user: req.user,
            userRole: req.user.role, // Send the role directly
        });
    } catch (error) {
        console.error('Error fetching requests:', error.message);
        res.status(500).send({
            message: 'Error fetching requests',
            error: error.message,
        });
    }
});


// Route to add a new request
router.get('/add', (req, res) => {
  res.render('requests/addRequest', { title: 'Add Equipment Request' });
});

router.post('/add', authenticate, async (req, res) => {
    try {
        const { equipmentName, category, reason, priority } = req.body;

        // Check if a similar request already exists
        const existingRequest = await Request.findOne({
            equipmentName,
            category,
            reason,
            priority,
            requestedBy: req.user._id, // Match with the user making the request
        });

        if (existingRequest) {
            return res.status(400).send({
                message: 'Duplicate request detected.',
            });
        }

        // If no duplicate, create a new request
        const newRequest = new Request({
            equipmentName,
            category,
            reason,
            priority,
            requestedBy: req.user._id, // Assign the user ID to the request
            status: 'Pending',
        });

        await newRequest.save();
        res.redirect('/requests/view'); // Redirect to the view page after saving
    } catch (error) {
        console.error('Error adding request:', error.message);
        res.status(500).send({
            message: 'Error adding request',
            error: error.message,
        });
    }
});

// Route to view all requests
// Route to view all requests
router.get('/view', authenticate, async (req, res) => {
    try {
        const requests = await Request.find().populate('requestedBy'); // Fetch requests
        const isAdmin = req.user.role === 'Admin';

        // Define the route for the dashboard based on the user's role
        const processedRequests = requests.map((request) => ({
            ...request.toObject(),
            canApproveOrReject: isAdmin, // Add a flag for admin actions
        }));

        res.render('requests/viewRequests', {
            title: 'Equipment Requests',
            requests: processedRequests, // Send processed data
            userRole: req.user.role, // Send the role directly
        });
    } catch (error) {
        console.error('Error fetching requests:', error.message);
        res.status(500).send({
            message: 'Error fetching requests',
            error: error.message,
        });
    }
});



router.post('/add', authenticate, async (req, res) => {
  try {
    const { equipmentName, category, reason, priority } = req.body;

    // Ensure the logged-in user's ID is used as `requestedBy`
    const newRequest = new Request({
      equipmentName,
      category,
      reason,
      priority,
      requestedBy: req.user._id, // Use the authenticated user's ObjectId
    });

    await newRequest.save();
    res.redirect('/requests'); // Redirect to the requests page
  } catch (error) {
    console.error('Error adding request:', error.message);
    res.status(400).send({
      message: 'Error adding request',
      error: error.message,
    });
  }
});


// Route to update request status (for managers)
router.post('/update/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).send('Request not found');
    }

    request.status = status;
    request.updatedAt = Date.now();
    await request.save();

    res.redirect('/requests');
  } catch (error) {
    console.error('Error updating request:', error);
    res.status(500).send({ message: 'Error updating request', error });
  }
});


// Route to approve a request
router.post('/approve/:id', async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).send({ message: 'Request not found' });
    }

    // Check if equipment already exists in the inventory
    let equipment = await Equipment.findOne({ name: request.equipmentName });
    if (!equipment) {
      // Add equipment to inventory
      equipment = new Equipment({
        name: request.equipmentName,
        category: request.category,
        notes: request.reason,
        addedBy: request.requestedBy,
        history: [
          {
            action: 'Added via request approval',
            performedBy: 'Manager',
            notes: request.reason,
          },
        ],
      });
      await equipment.save();
    } else {
      // Add history entry for existing equipment
      equipment.history.push({
        action: 'Linked to approved request',
        performedBy: 'Manager',
        notes: request.reason,
      });
      await equipment.save();
    }

    // Update request status
    request.status = 'Approved';
    request.updatedAt = Date.now();
    await request.save();

    res.redirect('/requests'); // Redirect back to requests page
  } catch (error) {
    console.error('Error approving request:', error);
    res.status(500).send({ message: 'Error approving request', error });
  }
});

// Route to reject a request
router.post('/reject/:id', async (req, res) => {
  try {
    const { reason } = req.body; // Get the rejection reason from the form

    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).send({ message: 'Request not found' });
    }

    // Update request status and add rejection reason
    request.status = 'Rejected';
    request.updatedAt = Date.now();
    request.rejectionReason = reason || 'No reason provided';

    await request.save();

    res.redirect('/requests'); // Redirect back to the requests list
  } catch (error) {
    console.error('Error rejecting request:', error.message);
    res.status(500).send({ message: 'Error rejecting request', error: error.message });
  }
});


// Route to link equipment to a request
router.post('/link/:id', async (req, res) => {
    try {
        const request = await Request.findById(req.params.id);
        if (!request) {
            return res.status(404).send({ message: 'Request not found' });
        }

        const equipment = await Equipment.findOne({ name: req.body.equipmentName });
        if (!equipment) {
            return res.status(404).send({ message: 'Equipment not found' });
        }

        // Link equipment to request
        request.equipmentId = equipment._id;
        request.status = 'Linked';
        await request.save();

        res.redirect('/requests/view');
    } catch (error) {
        console.error('Error linking equipment to request:', error);
        res.status(500).send({ message: 'Error linking equipment', error });
    }
});

module.exports = router;
