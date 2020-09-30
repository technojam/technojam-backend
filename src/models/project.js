const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    pid: {
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
    stack: {
        type: String,
        required: true
    },
    discussion: {
        type: String,
        required: false
    },
    maintainers: {
        type: String,
    },
    repository: {
        type: String
    }
})


module.exports = mongoose.model('Project', projectSchema);
