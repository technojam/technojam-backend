const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
	cid: {
		type: String,
		default: new Date().getTime().toString()
	},
	name: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true
	},
	date: {
		type: Date,
		default: Date.now
	},
	contact: {
		type: Number
		// required:true
	},
	query: {
		type: String
	}
});

module.exports = mongoose.model('Contacts', contactSchema);
