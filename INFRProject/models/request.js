const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  equipmentName: { type: String, required: true },
  category: { type: String, required: true },
  reason: { type: String, required: true },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent', 'Normal'],
    required: true,
  },
  requestedBy: { type: String, required: true },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Denied', 'Linked', 'Rejected'],
    default: 'Pending',
  },
  rejectionReason: { type: String, default: '' }, // Add rejection reason here
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
});


// Automatically set `updatedAt` on save
requestSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Request', requestSchema);
