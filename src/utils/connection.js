const mongoose = require('mongoose');
const config = require('config');
const url = process.env.MONGODB_URI || config.get('mongoURI');
const usersSchema = require('../models/user');
const contactSchema = require('../models/contact');

let collection = {};

collection.connectDB = async () => {
	try {
		await mongoose.connect(process.env.MONGOLAB_URI || url, {
			useNewUrlParser: true,
			useCreateIndex: true,
			useFindAndModify: false
		});

		console.log('MongoDB Connected...');
	} catch (err) {
		//console.error(err.message);
		// Exit process with failure
		process.exit(1);
	}
};

collection.getUsersCollection = async () => {
	try {
		let connectionString = await mongoose.connect(url, {
			useNewUrlParser: true
		});
		let userModel = await connectionString.model('Users', usersSchema);
		return userModel;
	} catch (err) {
		let error = new Error('Could not connect to Database:' + err);
		error.status = 500;
		throw error;
	}
};

collection.getContactCollection = async () => {
	try {
		let connectionString = await mongoose.connect(url, {
			useNewUrlParser: true
		});
		let contactModel = await connectionString.model('Contacts', contactSchema);
		return contactModel;
	} catch (err) {
		let error = new Error('Could not connect to Database:' + err);
		error.status = 500;
		throw error;
	}
};

module.exports = collection;
