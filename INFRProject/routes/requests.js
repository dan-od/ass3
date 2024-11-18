const express = require('express');
const router = express.Router();
const Request = require('../models/request');
const Equipment = require('../models/equipment'); 

// Route to view all requests
router.get('/', async (req, res) => {
  try {
    const requests = await Request.find();
    res.render('requests/viewRequests', { title: 'Equipment Requests', requests });
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).send({ message: 'Error fetching requests', error });
  }
});

// Route to add a new request
router.get('/add', (req, res) => {
  res.render('requests/addRequest', { title: 'Add Equipment Request' });
});

// Route to view all requests
router.get('/view', async (req, res) => {
  try {
    const requests = await Request.find();
    res.render('requests/viewRequests', { title: 'Equipment Requests', requests });
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).send({ message: 'Error fetching requests', error });
  }
});


router.post('/add', async (req, res) => {
  try {
    const { equipmentName, category, reason, priority } = req.body;
    const newRequest = new Request({
      equipmentName,
      category,
      reason,
      priority,
      requestedBy: 'engineer', // Placeholder; can be dynamic once roles are added
    });

    await newRequest.save();
    res.send(`<p>Request submitted successfully! <a href="/requests">View Requests</a></p>`);
  } catch (error) {
    console.error('Error adding request:', error);
    res.status(500).send({ message: 'Error adding request', error });
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
