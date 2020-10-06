const express = require('express');
const router = express.Router();
const Token = require('../models/token');
const User = require('../models/user');
const sanitize = require('mongo-sanitize');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const path = require('path');

// @route    GET api/verification/:token
// @desc     Initial Check for Token
// @access   Public
router.get('/:token', async (req, res)=> {
    try {
        const token = await Token.findOne({token: req.params.token})

        // If Token Not Found in Token Collection
        if(!token){
            res.set('Content-Type', 'text/html');
            return res.status(400).send(`
                <h2 style="color: red;" align="center">We were unable to find a valid token! Your token is expired! <a href="#">Resend Confirmation Email<a/></h2>
                
            `);
        }
        const user = await User.findOne({uid: token._userId});

        // If User Not Found
        if(!user) return res.status(400).send(`
        <h2 style="color: red;" align="center">User not found! Please <a href="https://technojam.tech/">Signup Now!<a/></h2>
        `);

        // If Already Verified
        if (user.isVerified) return res.status(400).send(`
        <h2 style="color: green;" align="center">User Already Verified Please <a href="https://technojam.tech/">Login Now!<a/></h2>
        `);
        else {
            res.sendFile(path.join(__dirname, '../docs', 'verification.html'));
        }
	} catch (err) {
		res.status(401).json({ msg: 'Token is not valid' });
	}
});

// @route    PATCH api/verification
// @desc     User Token Verification and Document Change
// @access   Public
router.patch('/', async (req, res)=> {
    const userToken = sanitize(req.body);
    try {
        const token = await Token.findOne({token: userToken.token})

        // If Token Not Found in Token Collection
        if(!token){
            return res.status(400).send(`
                <h2 style="color: red;" align="center">We were unable to find a valid token! Your token is expired! <a href="#">Resend Confirmation Email<a/></h2>
                
            `);
        }
        const user = await User.findOne({uid: token._userId});

        // If User Not Found
        if(!user) return res.status(400).send(`
        <h2 style="color: red;" align="center">User not found! <br /> Please <a href="https://technojam.tech/">Signup Now!<a/></h2>
        `);

        // If Already Verified
        if (user.isVerified) return res.status(400).send(`
        <h2 style="color: green;" align="center">User Already Verified! <br /> Please <a href="https://technojam.tech/">Login Now!<a/></h2>
        `);

        // Verification If Not Verified 
        user.isVerified = true;
        user.save((err)=>{
            if (err) { return res.status(500).send('oops! something went wrong! please contact website maintainers!'); }
            res.send(`
            <h2 style="color: green;" align="center">User Verified! <br /> Please <a href="https://technojam.tech/">Login Now!<a/></h2>
            `);
        })
	} catch (err) {
        console.log(err.message);
		res.status(401).send('oops! something went wrong! please contact website maintainers!');
	}
});

// @route    POST api/verification/resend
// @desc     Resend Verification Token Email
// @access   Public
router.post('/resend', async(req, res)=> {
    const email = sanitize(req.body);
    try {
        const user = await User.findOne({email: email.email});

        // If User Not Found
        if(!user) return res.status(400).send({ msg: 'We were unable to find a user with that email.' });

        // If Already Verified Account
        if (user.isVerified) return res.status(400).send({ msg: 'This account has already been verified. Please log in.' });

        // If Token Document Expired Create New Token Document
        const token = new Token({ _userId: user.uid, token: crypto.randomBytes(16).toString('hex') });
        await token.save();
        var transporter = nodemailer.createTransport({ 
            service: '"Mailjet"', 
            auth: { 
                user: process.env.mailUser||"588003a2b8d598baaa5a03f05fdeeddb", 
				pass: process.env.mailPass||"d9265a927778dd006c8904d6a127b94c" 
			} 
		});
		var mailOptions = { 
			from: process.env.mailFrom||'imhim45@outlook.com', 
            to: user.email, 
            subject: 'TechnoJam Account Verification', 
            text: 'Team TechnoJam Welcomes You,\n\n' + `Your Verification Code: ${token.token}\n\nPlease verify your account by clicking the link and submitting the verification code: \nhttp:\/\/` + req.headers.host + '\/api\/verification\/' + token.token + '.\n\n'  + 'Thank You,\nTeam TechnoJam'};
        transporter.sendMail(mailOptions, (err) => {
            if (err) { 
                console.log(err.message)
                return res.status(500).send({ msg: err.message }); }
            //res.status(201).send({msg: 'A verification email has been sent to ' + user.email + '.'});
            res.status(400).json({msg: 'Please check your mail to verify account.'});
        });
        res.status(400).json({msg: 'Please check your mail to verify account.'});
    }catch(err){
        res.status(400).json({msg:err.message});
    }
});

module.exports = router;