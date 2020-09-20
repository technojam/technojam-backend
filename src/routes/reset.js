const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const crypto =  require('crypto');
const nodemailer =  require('nodemailer');
const sanitize = require('mongo-sanitize');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'technojam.reply@gmail.com' ,
        pass: 'enter app password here'
    }
});

const mailOptions = {
    from: 'Password Reset <technojam.reply@gmail.com>', // Something like: John Snow <john@gmail.com>
    to: null,
    subject: 'noReply-password reset info', // email subject
};

const reset_expiry_days = 2; // number of days after which reset link expires
const exp_ms = reset_expiry_days*24*60*60*1000; // days to millisecond

const User = require('../models/user');

/*
expects body
{
    email: "users email"
}
*/
router.post('/forget', (req, res) => {
    User.findOne(req.body)
    .then(user => {
        if(!user){
            return res.status(400).json({ msg: `No user with ${req.body.email} email`});
        }

        crypto.randomBytes(48, (err, buffer)=>{
            if(err){
                return res.status(500).json({ msg: `Reset token not generated`});
            }
            const token = buffer.toString('hex');
            user.resetInfo = {
                token: token,
                expiry: Date.now()+exp_ms
            }

            user.save()
            .then(user => {

                const html = `
                <p style="font-size: 18px;">Hello ${user.name},</p>
                <p style="font-size: 18px;">You have requested to reset the password of your account kindly visit below link for further instructions.</p>
                <br/>
                <a href="${req.hostname}">${req.hostname}</a>
                <br/><br/>
                `;
                mailOptions.html = html;
                mailOptions.to = user.email;
                transporter.sendMail(mailOptions, (err, info)=>{
                    if(err){
                        res.status(500).json(err);
                    }else{
                        res.status(200).json({info: info, 
                        msg: 'Mail has been send to your registered id',
                        token: user.resetInfo
                        })
                    }
                });

            }, err => res.status(500).send('Server error'))
            .catch(err => {
                console.error(err.message);
		        res.status(500).send('Server error');
            })

        });

    }, err => res.status(500).send('Server error'))
    .catch(err => {
        console.error(err.message);
		res.status(500).send('Server error');
    })
});


/*
expects body
{
    token: "token send to users email",
    email: "users email",
    password: "new password"
}
*/
router.post('/reset', (req, res)=>{
    User.findOne({
        email: req.body.email
    })
    .then(user => {
        if(!user){
            return res.status(400).json({ msg: `No user with ${req.body.email} email`});
        }
        if(user.resetInfo.expiry == undefined){
            return res.status(200).json({ msg: `Invalid url`});
        }
        const currDate = Date.now();
        if(currDate > user.resetInfo.expiry) {
            return res.status(200).json({ msg: `Sorry this link is expired`});
        }
        if(req.body.token != this.user.resetInfo.token){
            return res.status(200).json({ msg: `Invalid token`});
        }

        bcrypt.genSalt(10, (err, salt) => {
            if(err){
                return res.status(500).json(err);
            }
            bcrypt.hash(req.body.password, salt, (err, hash)=>{
                if(err){
                    return res.status(500).json(err);
                }
                user.password = hash;
                user.resetInfo = undefined;
                user.save()
                .then(user => {
                    if(!user){
                        return res.status(500).send('Server error');
                    }
                    res.status(200).json({user: user, msg:'Password successfully reset'})
                }, err => res.status(500).send('Server error'))
                .catch(err => {
                    console.error(err.message);
                    res.status(500).send('Server error');
                })
            });
        });

    }, err => res.status(500).send('Server error'))
    .catch(err => {
        console.error(err.message);
		res.status(500).send('Server error');
    })
})

module.exports = router;