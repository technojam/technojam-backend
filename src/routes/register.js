const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const sanitize = require('mongo-sanitize');

const User = require('../models/user');

// @route    POST api/users
// @desc     Register user
// @access   Public
router.post('/', async (req, res) => {
	const { name, email, password } = sanitize(req.body);
	console.log(name,email,password)
	try {
		let user = await User.findOne({ email });

		if (user) {
			return res.status(400).json({ msg: 'User already exists' });
		}
		user = new User({
			uid: new Date().getTime(),
			name,
			email,
			password
		});

		const salt = await bcrypt.genSalt(10);

		user.password = await bcrypt.hash(password, salt);

		await user.save();

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
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

module.exports = router;
