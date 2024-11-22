const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    status: {
        type: String, // Removed enum validation
        default: 'Available',
    },
    serialNumber: { type: String, unique: null, require:false },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to the User model
    history: [
        {
            action: { type: String, required: true },
            performedBy: { type: String }, // Allow strings instead of ObjectId
            notes: { type: String },
            date: { type: Date, default: Date.now },
        },
    ],
    notes: { type: String },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

// Add pre-save hook to validate and log history actions
equipmentSchema.pre('save', function (next) {
    if (!this.history || this.history.length === 0) {
        this.history = [
            {
                action: 'Added to Inventory',
                date: new Date(),
                performedBy: this.addedBy, // Ensure this is an ObjectId
            },
        ];
    }
    next();
});



module.exports = mongoose.model('Equipment', equipmentSchema);
