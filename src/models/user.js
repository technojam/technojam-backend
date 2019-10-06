const mongoose = require('mongoose');

const usersSchema = new mongoose.Schema({
	uid: {
		type: String,
		required: true,
		unique: true
	},
	role: {
		type: String,
		reruired: true,
		enum: ['user', 'admin'],
		default: 'user'
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
	password: {
		type: String,
		required: true
	},
	date: {
		type: Date,
		default: Date.now
	},
	phone: {
		type: Number
		// required:true
	},
	year: {
		type: Number
	},
	college: {
		type: String
	},
	enrollmentNo: {
		type: Number
	},
	registeredEvents: {
		type: [Number],
		default: []
	}
});

module.exports = mongoose.model('Users', usersSchema);
