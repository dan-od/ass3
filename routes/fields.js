const express = require('express');
const router = express.Router();
const Field = require('../models/field');

// List all fields
router.get('/', async (req, res) => {
  try {
    const fields = await Field.find().populate('equipment');
    res.render('fields/index', { title: 'Fields', fields });
  } catch (error) {
    res.status(500).send({ message: 'Error fetching fields', error });
  }
});

// Add new field
router.post('/add', async (req, res) => {
  const { name, location } = req.body;
  try {
    const newField = new Field({ name, location });
    await newField.save();
    res.send({ message: 'Field added successfully' });
  } catch (error) {
    res.status(500).send({ message: 'Error adding field', error });
  }
});

module.exports = router;
