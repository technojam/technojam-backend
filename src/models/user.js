const mongoose = require('mongoose');

const paassWordReset = new mongoose.Schema({
	token: {
		type: String,
		default: ''
	},
	expiry: {
		type: Date,
		default: Date.now()+2*86400000
	}
})

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
	resetInfo: paassWordReset
});

module.exports = mongoose.model('Users', usersSchema);
