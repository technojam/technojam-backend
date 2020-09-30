const express = require('express');
const router = express.Router();
const Achievements = require('../models/achievement');
const User = require('../models/user');
const auth = require('../utils/auth');
const sanitize = require('mongo-sanitize');
const uuidv4 = require('uuid/v4');

// @route    GET api/achievements
// @desc     Get List of achievements
// @access   Public
router.get('/', async (req, res) => {
	try {
		const achievements = await Achievements.find({});
		res.json(achievements);
	} catch (err) {
		console.log(err.message);
		res.status(500).send('Server Error');
	}
});

// @route    POST api/achievements/add
// @desc     add new Achievements
// @access   Private: Only admins can add Achievements
router.post('/add', auth, async (req, res) => {
	// console.log("Entered");
	// console.log(req.body);
	const achievement = sanitize(req.body);
	achievement.aid = uuidv4();
	
	try {
		const user = await User.findOne({ uid: req.user.uid }).select('-password');
		if (user.role != 'admin') res.status(401).json({ msg: 'Not authorized' });
		else {
			let achievementCreation = await Achievements.create(achievement);
			if (achievementCreation) {
				return res.status(201).json({ msg: 'Achievement Added Successfully' });
			} else {
				return res.status(400).json({ msg: 'Failed: Add Achievement Operation' });
			}
		}
	} catch (err) {
		return res.status(500).send({ 'Server Error': err.message });
	}
});

// @route    DELETE api/achievements/:achievementsId/delete
// @desc     delete a single Achievements
// @access   Private: only admins can delete Achievements
router.delete('/delete/:achievementId', auth, async (req, res) => {
	const achievementId = req.params.achievementId;
	try {
		const user = await User.findOne({ uid: req.user.uid }).select('-password');
		if (user.role != 'admin') res.status(404).json({ msg: 'Not authorized' });
		else {
			const achievementsDeletion = await Achievements.deleteOne({ aid: achievementId });
			if (achievementsDeletion.n > 0) return res.json({ msg: `Achievement Deletion Success` });
			else return res.json({ msg: `Error in deleting` });
		}
	} catch (err) {
		return res.status(500).send('Server Error:', err);
	}
});

module.exports = router;
