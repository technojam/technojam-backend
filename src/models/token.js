const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
    _userId: { 
        type: String, 
        required: true, 
        ref: 'User',
    },
    token: { 
        type: String, 
        required: true 
    },
    createdAt: { 
        type: Date, 
        required: true, 
        default: Date.now, 
        index: { expires: 43200 } 
    },
});

module.exports = mongoose.model('Tokens', tokenSchema);