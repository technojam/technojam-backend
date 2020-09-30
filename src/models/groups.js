const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    gid: {
		type: String,
		required: true,
		unique: true
    },
    title: {
        type: String,
    },
    description:{
        type: String,   
    },
    communication: {
        type: String
    }
})


module.exports = mongoose.model('Groups', groupSchema);
