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
    description:{
        type: String,
        required: true
    },
    communication: {
        type: String
    }
})


module.exports = mongoose.model('Groups', groupSchema);
