const express = require('express');
const router = express.Router();
const Group = require('../models/groups');
const User = require('../models/user');
const auth = require('../utils/auth');
const sanitize = require('mongo-sanitize');
var base64 = require('base-64');
var utf8 = require('utf8');
const sendpulse = require("sendpulse-api");
const axios = require('axios')

var API_USER_ID = "af3f0a12cb0b1725f21b40f87ea832f2";
var API_SECRET = "eae0a1d917254e0b0bcbd242795c1029";
var TOKEN_STORAGE = "/tmp/";
var response = null;
var request = require('request');
var formData = {
	grant_type: "client_credentials",
	client_id: "e62e4ec67e8fe9f7e7f2eec8b88e47dd",
	client_secret: "19005d43864e41f6b8216d59e90dd558"
}

// @route    GET api/groups
// @desc     Get List of Groups
// @access   Public
router.get('/', async (req, res) => {
	try {
		const groups = await Group.find({});
		res.json(groups);
	} catch (err) {
		console.log(err.message);
		res.status(500).send('Server Error');
	}
});

router.post('/addTemplate', async (req, res) => {
	try {
		axios.post('https://api.sendpulse.com/oauth/access_token', formData).then((response) => {
			token = response.data.access_token;

			var text = req.body.text;
			console.log("body:", text)
			var name = req.body.name;
			axios.post('https://api.sendpulse.com/template', { name, body: text }, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/x-www-form-urlencoded" } })
				.then(resp => {
					if (resp.data.result)
						res.json({ id: resp.data.real_id, code: 200 });
				}).catch(err => {
					console.log("error msg:", err.message)
					res.json({ msg: err })
				})
		}).catch((error) => {
			console.log("hefsccse")
			msg = error.message
			res.json({ msg })
		})
	} catch (err) {
		res.status(500).send({ 'Server Error': err.message });
	}
});

router.post('/add', async (req, res) => {
	const group = sanitize(req.body);
	try {
		let groupCreation = await Group.create(group);
		if (groupCreation) {
			return res.status(201).json({ msg: 'Group Added Successfully' });
		} else {
			return res.status(400).json({ msg: 'Failed: Add Group Operation' });
		}
	} catch (err) {
		res.status(500).send({ 'Server Error': err.message });
	}
});

// @route    DELETE api/groups/:groupId/delete
// @desc     delete a single group
// @access   Private: only admins can delete groups
router.delete('/delete/:groupId', auth, async (req, res) => {
	const groupId = req.params.groupId;
	try {
		const deleteGroup = await Group.deleteOne({ uid: groupId });
		if (deleteGroup.n > 0) return res.json({ msg: `Group Deletion Success` });
		else return res.json({ msg: `Error in deleting` });
	} catch (err) {
		return res.status(500).send('Server Error:', err);
	}
});

router.put('/update/:groupId', async (req, res) => {
	const groupId = req.params.groupId;
	const html = req.body.html;
	const json = req.body.json;

	try {
		const updateGroup = await Group.updateOne({ uid: groupId }, { html: html, json: json });
		if (updateGroup.n > 0) return res.json({ msg: `Group updated successfully` });
		else return res.json({ msg: `Error in updating` });
	} catch (err) {
		return res.status(500).send('Server Error:', err);
	}
});

module.exports = router;
