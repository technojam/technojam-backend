const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
	eid: {
		type: String,
		required: true,
		unique: true
	},
	type: {
		type: String,
		reruired: true,
		enum: ['single', 'team'],
		default: 'single'
	},
	name: {
		type: String,
		required: true
	},
	desciption: {
		type: String
	},
	longDescription: {
		type: String
	},
	capacity: {
		type: Number
	},
	venue: {
		type: String
	},
	timing: {
		type: Date
	},
	isPaid: {
		type: Boolean,
		default: false
	},
	amount: {
		type: Number,
		default: 0
	},
	users: {
		type: [Number],
		default: []
	}
});

module.exports = mongoose.model('Events', eventSchema);
