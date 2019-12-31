const express = require('express');
const router = express.Router();
const auth = require('../utils/auth');
const sanitize = require('mongo-sanitize');
const Contact = require('../models/contact');
const User = require('../models/user');
const uuid = require('uuid/v4');
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

		if (contact1) {
			return res.status(201).json({ code: 'QUERY_SUBMIT_SUCCESS', msg: 'Query submitted successfully' });
		} else return res.status(400).json({ code: 'QUERY_SUBMIT_FAILED', msg: 'Could not submit' });
	} catch (err) {
		console.log(err);
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
		if (user.role != 'admin') res.status(401).json({ code: 'QUERY_DELETE_UNAUTHORISED', msg: 'Not authorized' });
		else {
			const dContact = await Contact.deleteMany({ cid: { $in: cids } });
			console.log('dContact', dContact);
			if (dContact.n > 0)
				res.status(202).json({ code: 'QUERY_DELETE_SUCCESS', msg: `Deleted ${dContact.n} query successfully` });
			else res.status(400).json({ code: 'QUERY_DELETE_FAILED', msg: `Error in deleting` });
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
		if (user.role != 'admin') res.status(401).json({ code: 'QUERY_FETCH_UNAUTHORISED', msg: 'Not authorized' });
		else {
			const dContact = await Contact.find({});
			if (dContact) res.json(dContact);
			else res.status(400).json({ code: 'QUERY_FETCH_ERROR', msg: `Error in fetching` });
		}
	} catch (err) {
		res.status(500).send({ 'Server Error': err.message });
	}
});
module.exports = router;
