const mongoose = require('mongoose');

const usersSchema = new mongoose.Schema({
	uid: {
		type: String,
		required: true,
		unique: true
	},
	profileImg: {
		type: String,
		default: ''
	},
	role: {
		type: String,
		required: true,
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
		type: [String],
		default: []
	},
	isVerified: {
		type: Boolean,
		required: true,
		default: false
	}
});

module.exports = mongoose.model('Users', usersSchema);
