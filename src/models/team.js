const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
	mid: {
		type: String,
		required: true,
		unique: true
    },
	profileImg: {
		type: String,
        default: '',
        required:true,
        unique:true
	},
	name: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true,
		unique: true
	},
	phone: {
		type: Number
		// required:true
	},
	batch: {
        type: String,
        required:true
	},
	githubUrl: {
        type: String,
        required:true
	},
	linkedinUrl: {
        type: String,
        required:true
    },
    position:{
        type: String,
        default:"Member"
    }
});

module.exports = mongoose.model('Team', teamSchema);
