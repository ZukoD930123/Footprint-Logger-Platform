const mongoose = require('mongoose');

const CarbonLogSchema = new mongoose.Schema({
     
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    activity: { 
        type: String, 
        required: true 
    },
    amount: { 
        type: Number, 
        required: true 
    },
    date: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('CarbonLog', CarbonLogSchema);