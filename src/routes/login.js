const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const auth = require('../utils/auth');
const jwt = require('jsonwebtoken');
const config = require('config');
const sanitize = require('mongo-sanitize');
const User = require('../models/user');

// @route    GET api/auth
// @desc     Get logged user
// @access   Private
router.get('/', auth, async (req, res) => {
	try {
		const user = await User.findOne({ uid: req.user.uid }).select('-password');
		res.json(user);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

router.put('/', auth, async (req, res) => {
	try {
		const user = await User.updateOne({ uid: req.user.uid },sanitize(req.body))
		res.json({msg:"User updated successfully"});
	} catch (err) {
		//console.error(err.message);
		res.status(500).send('Server Error');
	}
});

// @route    POST api/auth
// @desc     Authenticate user & get token
// @access   Public
router.post('/', async (req, res) => {
	const { email, password } = sanitize(req.body);

	try {
		let user = await User.findOne({ email });

		if (!user) {
			return res.status(400).json({ msg: 'Email doesnt exist' });
		}

		const isMatch = await bcrypt.compare(password, user.password);

		if (!isMatch) {
			return res.status(400).json({ msg: 'Invalid Credentials' });
		}

		const payload = {
			user: {
				uid: user.uid,
				name: user.name
			}
		};

		jwt.sign(
			payload,
			config.get('secret'),
			{ expiresIn: 360000 },
			(err, token) => {
				if (err) throw err;
				res.json({ token });
			}
		);
	} catch (err) {
		res.status(500).send('Server error');
	}
});

module.exports = router;
