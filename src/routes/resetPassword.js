const express = require('express');
const router = express.Router();
const Token = require('../models/token');
const User = require('../models/user');
const sanitize = require('mongo-sanitize');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const path = require('path');
const bcrypt = require('bcryptjs');
const config = require('config');
const mail_user = process.env.user || config.get('user');
const mail_pass = process.env.pass || config.get('pass');
const mail_from = process.env.from || config.get('from');
// @route    GET api/reset/:token
// @desc     Initial Check for Token
// @access   Public
router.get('/:token', async (req, res)=> {
    try {
        const token = await Token.findOne({token: req.params.token})

        // If Token Not Found in Token Collection
        if(!token){
            res.set('Content-Type', 'text/html');
            return res.status(400).send(`
                <h2 style="color: red;" align="center">We were unable to find a valid token! Your token is expired! <a href="#">Resend  Email<a/></h2>
                
            `);
        }
        const user = await User.findOne({uid: token._userId});

        // If User Not Found
        if(!user) return res.status(400).send(`
        <h2 style="color: red;" align="center">User not found! Please <a href="#">Signup Now!<a/></h2>
        `);

        res.sendFile(path.join(__dirname, '../docs', 'resetPassword.html'));
	} catch (err) {
		res.status(401).json({ msg: 'Token is not valid' });
	}
});

// @route    PATCH api/reset/
// @desc     User Token Verification and Document Change
// @access   Public
router.patch('/', async (req, res)=> {
    const userToken = sanitize(req.body.token);
    const newPass = sanitize(req.body.password);
    try {
        const token = await Token.findOne({token: userToken})

        // If Token Not Found in Token Collection
        if(!token){
            return res.status(400).send(`
                <h2 style="color: red;" align="center">We were unable to find a valid token! Your token is expired! <a href="#">Resend Confirmation Email<a/></h2>
                
            `);
        }
        const user = await User.findOne({uid: token._userId});

        // If User Not Found
        if(!user) return res.status(400).send(`
        <h2 style="color: red;" align="center">User not found! <br /> Please <a href="#">Signup Now!<a/></h2>
        `);

        // Updating Password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPass, salt);
        user.save((err)=>{
            if (err) { return res.status(500).send('oops! something went wrong! please contact website maintainers!'); }
            res.send(`
            <h2 style="color: green;" align="center">Password Updated! <br /> Please <a href="https://technojam.tech/">Login Now!<a/></h2>
            `);
        })
	} catch (err) {
        console.log(err.message);
		res.status(401).send('oops! something went wrong! please contact website maintainers!');
	}
});

// @route    POST api/reset/send
// @desc     Send Reset password Token Email
// @access   Public
router.post('/send', async(req, res)=> {
    const email = sanitize(req.body);
    try {
        const user = await User.findOne({email: email.email});

        // If User Not Found
        if(!user) return res.status(400).send({ msg: 'We were unable to find a user with that email.' });

        
        // If Token Document Expired Create New Token Document
        const token = new Token({ _userId: user.uid, token: crypto.randomBytes(16).toString('hex') });
        await token.save();
        var transporter = nodemailer.createTransport({ 
            service: '"Mailjet"', 
            auth: { 
                user: mail_user, 
                pass: mail_pass
            } 
        });
        var mailOptions = { 
            from: mail_from,
            to: user.email, 
            subject: 'TechnoJam Password Reset', 
            text: 'Team TechnoJam Welcomes You,\n\n' + `Your Verification Code: ${token.token}\n\nPlease reset your password by clicking the link and submitting the verification code: \nhttp:\/\/` + req.headers.host + '\/api\/reset\/' + token.token + '.\n\n'  + 'Thank You,\nTeam TechnoJam'};
        transporter.sendMail(mailOptions, (err) => {
            if (err) { return res.status(500).send({ msg: err.message }); }
            res.status(201).send({msg: 'A reset password email has been sent to ' + user.email + '.'});
        });
        res.send({msg: 'Reset Password Email Sent Successfully!'});
    }catch(err){
        res.send({msg: err.message});
    }
});

module.exports = router;