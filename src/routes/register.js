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
const MAILER_USER = process.env.MAILER_USER;
const MAILER_PASS = process.env.MAILER_PASS;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

// @route    POST api/users
// @desc     Register user
// @access   Public
router.post('/', async (req, res) => {
	const { name, email, password } = sanitize(req.body);
	console.log(name, email, password)
	try {
		let user = await User.findOne({ email });

		if (user) {
			return res.status(400).json({ code: 'USER_ALREADY_REGISTERED', msg: 'User already exists' });
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
				user: `${MAILER_USER}`,
				pass: `${MAILER_PASS}`
			}
		});
		var mailOptions = {
			from: `${ADMIN_EMAIL}`,
			to: user.email,
			subject: 'TechnoJam Account Verification',
			text: 'Team TechnoJam Welcomes You,\n\n' + `Your Verification Code: ${token.token}\n\nPlease verify your account by clicking the link and submitting the verification code: \nhttp:\/\/` + req.headers.host + '\/api\/verification\/' + token.token + '.\n\n' + 'Thank You,\nTeam TechnoJam'
		};
		transporter.sendMail(mailOptions, (err) => {
			if (err) { return res.status(500).send({ msg: err.message }); }
			res.status(201).json({ code: 'USER_CREATED', msg: 'Account Created! Please check your mail to confirm account.' });
		});
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

module.exports = router;
