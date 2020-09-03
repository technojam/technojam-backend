const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
	eid: {
		type: String,
		required: true,
		unique: true
	},
	type: {
		type: String,
		required: true,
		//enum: ['Single', 'Team'],
		default: 'Single'
	},
	name: {
		type: String,
		required: true
	},
	description: {
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
		type: String
	},
	date:{
		type:String,
		required:true
	},
	isPaid: {
		type: String,
		default: false
	},
	amount: {
		type: Number,
		default: 0
	},
	teamSize:{
		type:String
	},
	resources:{
		type:String
	},
	users: {
		type: [String],
		default: []
	}
});

module.exports = mongoose.model('Events', eventSchema);



// type: '',
// 		name: '',
// 		description: '',
// 		longDescription:'',
// 		capacity:'',
// 		venue: '',
// 		timing: '',
// 		date: '',
// 		isPaid:'',
// 		amount:"",
// 		teamSize: ''