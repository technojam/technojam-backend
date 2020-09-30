const express = require('express');
const auth = require('../utils/auth');
const sanitize = require('mongo-sanitize');
const router = express.Router();
const Events = require('../models/event');
const User = require('../models/user');
const uuidv4 = require('uuid/v4');

// @route    GET api/events
// @desc     fetch all events
// @access   Public
router.get('/', async (req, res) => {
	try {
		const events = await Events.find({}).sort({date:1});
		res.json(events);
	} catch (err) {
		console.log(err.message);
		res.status(500).send('Server Error');
	}
});

// @route    GET api/events/:eventId
// @desc     fetch single event details
// @access   Public
router.get('/:eventId', async (req, res) => {
	try {
		const event = await Events.findOne({ eid: req.params.eventId });
		if (!event) {
			res.status(404).send('Resource Not Found');
		} else {
			return res.json(event);
		}
	} catch (err) {
		console.log(err.message);
		res.status(500).send('Server Error');
	}
});

// @route    GET api/events/:eventId/participants
// @desc     fetch all participants of an event
// @access   Private:only admins can access
router.get('/participants/:eventId',auth, async (req, res) => {
	try {
		const eventParticipants = (await Events.findOne({ eid: req.params.eventId })).users;
		var registered_users=[]
		for(var i=0;i<eventParticipants.length;i++){
			registered_users.push(await User.findOne({uid:eventParticipants[i]},{name:1,email:1,_id:0}))
		}
		return res.json(registered_users);
	} catch (err) {
		console.log(err.message);
		res.status(500).send('Server Error');
	}
});

// @route    POST api/events/add
// @desc     add new event
// @access   Private: Only admins can add events
router.post('/add', auth, async (req, res) => {
	console.log("Entered");
	console.log(req.body);
	const event = sanitize(req.body);
	event.eid = uuidv4();
	try {
		const user = await User.findOne({ uid: req.user.uid }).select('-password');
		//console.log('user:', user);
		//console.log('uid:', req.user.uid);
		if (user.role != 'admin') res.status(401).json({ msg: 'Not authorized' });
		else {
			let eventCreation = await Events.create(event);
			if (eventCreation) {
				return res.status(201).json({ msg: 'Event Added Successfully' });
			} else {
				return res.status(400).json({ msg: 'Failed: Add Event Operation' });
			}
		}



	} catch (err) {
		res.status(500).send({ 'Server Error': err.message });
	}
});

// @route    POST api/events/:eventId/register
// @desc     Rehister user for an event
// @access   Private: Only registered members can register themselves
router.put('/register/:eventId/', auth, async (req, res) => {
	const userId = req.user.uid;
	const eventId = req.params.eventId;
	try {
		let registeredUsers = await Events.findOne({ eid: eventId }).select(
			'users'
		);
		if (registeredUsers.users.includes(userId)) {
			return res.status(400).json({ msg: 'User Already Registered' });
		} else {
			let userRegistration = await Events.updateOne(
				{ eid: eventId },
				{ $push: { users: userId } }
			);
			let addEventToUserProfile = await User.updateOne(
				{ uid: userId },
				{ $push: { registeredEvents: eventId } }
			);
			if (userRegistration && addEventToUserProfile) {
				return res.status(201).json({ msg: 'Event Registration Completed' });
			} else {
				return res.status(400).json({ msg: 'Event Registration Failed' });
			}
		}
	} catch (err) {
		res.status(500).send({ 'Server Error': err.message });
	}
});

// @route    DELETE api/events/:eventId/delete
// @desc     delete a single event
// @access   Private: only admins can delete events
router.delete('/delete/:eventId', auth, async (req, res) => {
	const eventId = req.params.eventId;
	
	try {
		const user = await User.findOne({ uid: req.user.uid }).select('-password');
		if (user.role != 'admin') res.status(404).json({ msg: 'Not authorized' });
		else {
			const deleteEvent = await Events.deleteOne({ eid: eventId });
			console.log(deleteEvent);
			if (deleteEvent.n > 0) res.json({ msg: `Event Deletion Success` });
			else res.json({ msg: `Error in deleting` });
		}
	} catch (err) {
		console.log('err:', err);
		res.status(500).send('Server Error:', err);
	}
});
// @route    DELETE api/events/update/:eventId
// @desc     update a single event
// @access   Private: only admins can delete events
router.put('/update/:eventId',auth,async(req,res)=>{
	const eventId=req.params.eventId;
	const event = sanitize(req.body);
	try {
		const user = await User.findOne({ uid: req.user.uid }).select('-password');
		if (user.role != 'admin') res.status(401).json({ msg: 'Not authorized' });
		else {
			let eventUpdation = await Events.updatOne({'eid':eventId},{$set:event})
			if (eventUpdation) {
				return res.status(201).json({ msg: 'Event Updated Successfully' });
			} else {
				return res.status(400).json({ msg: 'Failed: Update Event Operation' });
			}
		}
	} catch (err) {
		res.status(500).send({ 'Server Error': err.message });
	}
})

module.exports = router;
