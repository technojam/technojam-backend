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
		const events = await Events.find({});
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
			res.status(404).json({ code: 'EVENT_NOT_FOUND', msg: 'Resource Not Found' });
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
// @access   Public
router.get('/participants/:eventId', async (req, res) => {
	try {
		const eventParticipants = await Events.findOne({ eid: req.params.eventId });
		return res.json(eventParticipants.users);
	} catch (err) {
		console.log(err.message);
		res.status(500).send('Server Error');
	}
});

// @route    POST api/events/add
// @desc     add new event
// @access   Private: Only admins can add events
router.post('/add', auth, async (req, res) => {
	const event = sanitize(req.body);
	event.eid = uuidv4();
	try {
		const user = await User.findOne({ uid: req.user.uid }).select('-password');
		console.log('user:', user);
		console.log('uid:', req.user.uid);
		if (user.role != 'admin') res.status(401).json({ code: 'EVENT_ADD_UNAUTHORISED', msg: 'Not authorized' });
		else {
			let eventCreation = await Events.create(event);
			if (eventCreation) {
				return res.status(201).json({ code: 'EVENT_ADDED', msg: 'Event Added Successfully' });
			} else {
				return res.status(400).json({ code: 'EVENT_ADD_FAILED', msg: 'Failed: Add Event Operation' });
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
			return res.status(400).json({ code: 'EVENT_ALREADY_REGISTERED', msg: 'User Already Registered' });
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
				return res.status(201).json({ code: 'EVENT_REGISTERED', msg: 'Event Registration Completed' });
			} else {
				return res.status(400).json({ code: 'EVENT_REGISTER_FAILED', msg: 'Event Registration Failed' });
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
		if (user.role != 'admin') res.status(401).json({ code: 'EVENT_DELETE_UNAUTHORISED', msg: 'Not authorized' });
		else {
			const deleteEvent = await Events.deleteOne({ eid: eventId });
			console.log(deleteEvent);
			if (deleteEvent.n > 0) res.json({ code: 'EVENT_DELETED', msg: `Event Deletion Success` });
			else res.json({ code: 'EVENT_DELETE_FAILED', msg: `Error in deleting` });
		}
	} catch (err) {
		console.log('err:', err);
		res.status(500).send('Server Error:', err);
	}
});

module.exports = router;
