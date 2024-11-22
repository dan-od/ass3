const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
    equipmentName: { type: String, required: true },
    category: { type: String, required: true },
    reason: { type: String, required: true },
    priority: { type: String, enum: ['Normal', 'High Priority'], required: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Denied'], default: 'Pending' },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Request', requestSchema);
