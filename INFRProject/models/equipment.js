const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  status: {
    type: String,
    enum: ['Available', 'Assigned', 'In Use', 'Needs Repair', 'Retired'],
    default: 'Available',
  },
  locationType: { type: String, enum: ['Base', 'Field'], default: 'Base' },
  notes: { type: String, default: '' },
  history: [
    {
      action: { type: String, required: true },
      date: { type: Date, default: Date.now },
      assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      performedBy: { type: String, default: 'Unknown' },
      notes: { type: String, default: '' },
    },
  ],
});

// Add pre-save hook to validate and log history actions
equipmentSchema.pre('save', function (next) {
  if (!this.history || this.history.length === 0) {
    this.history = [{
      action: 'Added to Inventory',
      date: new Date(),
      performedBy: this.addedBy || 'system',
    }];
  }
  next();
});

module.exports = mongoose.model('Equipment', equipmentSchema);
