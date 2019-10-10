const express = require('express');
const router = express.Router();
const auth = require('../utils/auth');
const sanitize = require('mongo-sanitize');
const Contact = require('../models/contact');
const User = require('../models/user');

// @route    POST api/contact
// @desc     submit new conact query
// @access   Public
router.post('/', async (req, res) => {
	const { name, email, contact, query } = sanitize(req.body);

	try {
		let contact1 = await Contact.create({
			name,
			email,
			contact,
			query
		});

		if (contact1) {
			return res.status(200).json({ msg: 'Query submitted successfully' });
		} else return res.status(400).json({ msg: 'Could not submit' });
	} catch (err) {
		res.status(500).send('Server error:', err);
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
		if (user.role != 'admin') res.status(404).json({ msg: 'Not authorized' });
		else {
			const dContact = await Contact.find({});
			if (dContact) res.json(dContact);
			else res.json({ msg: `Error in fetching` });
		}
	} catch (err) {
		res.status(500).send('Server Error:', err);
	}
});
module.exports = router;
