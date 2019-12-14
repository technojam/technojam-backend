const express = require('express');
const router = express.Router();
const auth = require('../utils/auth');
const sanitize = require('mongo-sanitize');
const Contact = require('../models/contact');
const User = require('../models/user');
const uuid = require('uuid/v4');
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
			return res.status(200).json({ msg: 'Query submitted successfully' });
		} else return res.status(400).json({ msg: 'Could not submit' });
	} catch (err) {
		console.log(err);
		res.status(500).send('Server error:');
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
// router.get('/', async (req, res) => {
// 	try {
// 		axios.post('https://api.sendpulse.com/oauth/access_token', formData).then((response) => {
// 			console.log(response)
// 			d = response.data;
// 			res.json({ d });
// 		}).catch((error) => {
// 			console.log("hefsccse")
// 			msg = error.message
// 			res.json({ msg })
// 		})
// 	} catch (err) {
// 		res.status(500).send({ 'Server Error': err.message });
// 	}
// });


router.get('/', async (req, res) => {
	try {
		axios.post('https://api.sendpulse.com/oauth/access_token', formData).then((response) => {
			token = response.data.access_token;
			console.log("tokendgdgd:", token)
			axios.get('https://api.sendpulse.com/addressbooks', { headers: { Authorization: `Bearer ${token}` } }).then(resp => {
				// console.log("resp:", resp.data)
				if (resp.data)
					// console.log("data:", resp.data)
					res.json({ data: resp.data, code: 200 });
			}).catch(err => {
				console.log("error msg:", err.message)
				res.json({ msg: err.message })
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

router.get('/list/:id', async (req, res) => {
	const id = req.params.id;
	console.log("id:", id);
	try {
		axios.post('https://api.sendpulse.com/oauth/access_token', formData).then((response) => {
			token = response.data.access_token;
			console.log("tokendgdgd:", token)
			axios.get(`https://api.sendpulse.com/addressbooks/${id}/emails`, { headers: { Authorization: `Bearer ${token}` } }).then(resp => {
				console.log("resp:", resp.data)
				if (resp.data)
					// console.log("data:", resp.data)
					res.json({ data: resp.data, code: 200 });
			}).catch(err => {
				console.log("error msg:", err.message)
				res.json({ msg: err.message })
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

router.delete('/listDelete/:id', async (req, res) => {
	const id = req.params.id;
	console.log("id:", id);
	try {
		axios.post('https://api.sendpulse.com/oauth/access_token', formData).then((response) => {
			token = response.data.access_token;
			console.log("tokendgdgd:", token)
			axios.delete(`https://api.sendpulse.com/addressbooks/${id}`, { headers: { Authorization: `Bearer ${token}` } }).then(resp => {
				console.log("resp:", resp.data)
				if (resp.data.result)
					console.log("data:", resp.data)
				res.json({ result: resp.data.result, code: 200 });
			}).catch(err => {
				console.log("error msg:", err.message)
				res.json({ msg: err.message })
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

/**{
"emails":
[
  {
    "email": "test@test.com",
    "variables": {
      "Name": "Elise",
	  "Phone": "15747072233",
	  "Gender"
    }
  }
 ]
} */

router.post('/addMember/:listId', async (req, res) => {
	const listId = req.params.listId;
	console.log("body:", req.body)
	const formData1 = {
		emails:
			[
				{
					email: req.body.email,
					variables: {
						Name: req.body.name,
						Phone: req.body.phone,
						Gender: req.body.gender
					}
				}
			]
	}
	try {
		axios.post('https://api.sendpulse.com/oauth/access_token', formData).then((response) => {
			token = response.data.access_token;
			console.log("token:", token, "formData:", formData1)
			axios.post(`https://api.sendpulse.com/addressbooks/${listId}/emails`, formData1, { headers: { Authorization: `Bearer ${token}` } }).then(resp => {
				// console.log("resp:", resp.data)
				if (resp.data.result)
					console.log("result:", resp.data.result)
				res.json({ result: resp.data.result, code: 200 });
			}).catch(err => {
				console.log("error msg:", err.message)
				res.json({ msg: err.message })
			})
		}).catch((error) => {
			console.log("hefsccse:", error.message)
			msg = error.message
			res.json({ msg })
		})
	} catch (err) {
		res.status(500).send({ 'Server Error': err.message });
	}
});

router.post('/add', async (req, res) => {
	const name = req.body.name;
	try {
		axios.post('https://api.sendpulse.com/oauth/access_token', formData).then((response) => {
			// console.log("response:", response.data)
			token = response.data.access_token;
			console.log("token:", token, "  name:", name)
			axios.post('https://api.sendpulse.com/addressbooks', { bookName: name }, { headers: { Authorization: `Bearer ${token}` } }).then(resp => {
				// console.log("resp:", resp.data)
				if (resp.data.id)
					console.log("id:", resp.data.id)
				res.json({ id: resp.data.id, code: 200 });
			}).catch(err => {
				console.log("error msg:", err.message)
				res.json({ msg: err.message })
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

module.exports = router;
