const express = require('express');
const router = express.Router();
const auth = require('../utils/auth');
const sanitize = require('mongo-sanitize');
const Contact = require('../models/contact');
const User = require('../models/user');
const uuid = require('uuid/v4');
//const emailjs =require('emailjs-com');
const axios = require('axios')
// @route    POST api/contact
// @desc     submit new conact query
// @access   Public
router.post('/', async (req, res) => {
	const { name, email, contact, query } = sanitize(req.body);

	try {
		let contact1 = await Contact.create({
			cid: uuid(),
			name,
			email,
			contact,
			query
		});

		var data = {
			service_id: 'website_query',
			template_id: 'template_eayg70e',
			user_id: 'user_UFdm9NJkel5og9pPNCmrn',
			template_params: {
				name:name,
				email:email,
				message:query,
				contact:contact
			}
		};

		axios.post('https://api.emailjs.com/api/v1.0/email/send', {
			service_id: process.env.emailJsServiceId,
			template_id: 'template_eayg70e',
			user_id: process.env.emailJsId,
			template_params: {
				name:name,
				email:email,
				message:query,
				contact:contact
			}
		})
		.then(res => {
			console.log(`statusCode: ${res.statusCode}`)
			//console.log(res)
		})
			.catch(error => {
			console.error(error)
		})


		if (contact1) {
			console.log(contact1);
			return res.status(200).json({ msg: 'Query submitted successfully' });
		} else return res.status(400).json({ msg: 'Could not submit' });
	} catch (err) {
		console.log(err);
		res.status(500).send('Server error:');
	}
});

// @route    DELETE api/contact
// @desc     deleted multiple query
// @access   Private: only admins can deleted the query
router.delete('/', auth, async (req, res) => {
	const { cids } = sanitize(req.body);
	console.log('cids:', cids);
	try {
		const user = await User.findOne({ uid: req.user.uid }).select('-password');
		if (user.role != 'admin') res.status(404).json({ msg: 'Not authorized' });
		else {
			const dContact = await Contact.deleteMany({ cid: { $in: cids } });
			console.log('dContact', dContact);
			if (dContact.n > 0)
				res.json({ msg: `Deleted ${dContact.n} query successfully` });
			else res.json({ msg: `Error in deleting` });
		}
	} catch (err) {
		console.log('err:', err);
		res.status(500).send('Server Error:', err);
	}
});

// @route    GET api/contact
// @desc     fetch all submited queries
// @access   Private: only admins can fetch the query
router.get('/', auth, async (req, res) => {
	try {
		const user = await User.findOne({ uid: req.user.uid }).select('-password');
		if (user.role != 'admin') res.status(401).json({ msg: 'Not authorized' });
		else {
			const dContact = await Contact.find({});
			if (dContact) res.json(dContact);
			else res.json({ msg: `Error in fetching` });
		}
	} catch (err) {
		res.status(500).send({'Server Error': err.message});
	}
});
module.exports = router;
