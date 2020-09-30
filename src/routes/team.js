const express = require('express');
const auth =require('../utils/auth');
const sanitize = require('mongo-sanitize');
const router = express.Router();

const Team = require('../models/team');
const User = require('../models/user');
const uuidv4 = require('uuid/v4');

// @route    GET api/team
// @desc     fetch all team members
// @access   Public
router.get('/', async (req, res) => {
	try {
		const members = await Team.find({}).sort({batch:1});
		res.json(members);
	} catch (err) {
		console.log(err.message);
		res.status(500).send('Server Error');
	}
});

// @route    GET api/team/:memberId
// @desc     fetch single team member details
// @access   Public
router.get('/:memberId', async (req, res) => {
	try {
		const member = await Team.findOne({ mid: req.params.memberId });
		if (!member) {
			res.status(404).send('Resource Not Found');
		} else {
			return res.json(member);
		}
	} catch (err) {
		console.log(err.message);
		res.status(500).send('Server Error');
	}
});

// @route    POST api/team/add
// @desc     add new member
// @access   Private: Only admins can add member
router.post('/add', auth, async (req, res) => {
	//console.log(req.body);
	const member = sanitize(req.body);
	member.mid = uuidv4();
	try {
		const user = await User.findOne({ uid: req.user.uid }).select('-password');
		//console.log('user:', user);
		//console.log('uid:', req.user.uid);
		if (user.role != 'admin') res.status(401).json({ msg: 'Not authorized' });
		else {
			let memberCreation = await Team.create(member);
			if (memberCreation) {
				return res.status(201).json({ msg: 'Member Added Successfully' });
			} else {
				return res.status(400).json({ msg: 'Failed: Add Member Operation' });
			}
		}
	} catch (err) {
		res.status(500).send({ 'Server Error': err.message });
	}
});


// @route    DELETE api/team/delete/:memberId
// @desc     delete a single member
// @access   Private: only admins can delete member
router.delete('/delete/:memberId', auth, async (req, res) => {
	const mId = req.params.memberId;
	console.log("Entered")
	try {
		const user = await User.findOne({ uid: req.user.uid }).select('-password');
		if (user.role != 'admin') res.status(404).json({ msg: 'Not authorized' });
		else {
			const deleteMember = await Team.deleteOne({ mid: mId });
			console.log(deleteMember);
			if (deleteMember.n > 0) res.json({ msg: `Member Deletion Success` });
			else res.json({ msg: `Error in deleting` });
		}
	} catch (err) {
		console.log('err:', err);
		res.status(500).send('Server Error:', err);
	}
});

// @route    DELETE api/team/update/:memberId
// @desc     update a single event
// @access   Private: only admins can delete events
router.put('/update/:memberId',auth,async(req,res)=>{
	const mId=req.params.memberId;
	const member = sanitize(req.body);
	try {
		const user = await User.findOne({ uid: req.user.uid }).select('-password');
		if (user.role != 'admin') res.status(401).json({ msg: 'Not authorized' });
		else {
			let memberUpdation = await Team.updateOne({'mid':mId},{$set:member})
			if (memberUpdation) {
				return res.status(201).json({ msg: 'Member Updated Successfully' });
			} else {
				return res.status(400).json({ msg: 'Failed: Update Member Operation' });
			}
		}
	} catch (err) {
		res.status(500).send({ 'Server Error': err.message });
	}
})

module.exports = router;