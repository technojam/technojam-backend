const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const sanitize = require('mongo-sanitize');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const Token = require('../models/token');
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

		const token = new Token({ _userId: user.uid, token: crypto.randomBytes(16).toString('hex') });
		await token.save();
		var transporter = nodemailer.createTransport({ 
			service: '"Mailjet"', 
			auth: { 
				user: "588003a2b8d598baaa5a03f05fdeeddb", 
				pass: "d9265a927778dd006c8904d6a127b94c" 
			} 
		});
		var mailOptions = { 
			from: 'imhim45@outlook.com', 
			to: user.email, 
			subject: 'TechnoJam Account Verification', 
			text: 'Team TechnoJam Welcomes You,\n\n' + `Your Verification Code: ${token.token}\n\nPlease verify your account by clicking the link and submitting the verification code: \nhttp:\/\/` + req.headers.host + '\/api\/verification\/' + token.token + '.\n\n'  + 'Thank You,\nTeam TechnoJam'
		};
		transporter.sendMail(mailOptions, (err) => {
			if (err) { return res.status(500).send({ msg: err.message }); }
			res.status(201).send('Account Created! Please check your mail to confirm account.');
		});
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

module.exports = router;
