const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    uid: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    html: {
        type: String
    },
    json: {
        type: Object
    }
})

module.exports = mongoose.model('Templates', groupSchema);
