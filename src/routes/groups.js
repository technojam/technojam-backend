const express = require('express');
const router = express.Router();
const Group = require('../models/groups');
const User = require('../models/user')
const auth = require('../utils/auth');
const sanitize = require('mongo-sanitize');

// @route    GET api/groups
// @desc     Get List of Groups
// @access   Public
router.get('/', async(req, res)=> {
    try{
        const groups = await Group.find({ });
        res.json(groups);
    }catch(err){
        console.log(err.message);
        res.status(500).send('Server Error');
    }
})

// @route    POST api/groups/add
// @desc     add new group
// @access   Private: Only admins can add Groups
router.post('/add', auth, async(req, res)=> {
    const group = sanitize(req.body);
    try{
        const user = await User.findOne({ uid: req.user.uid }).select('-password');
        if (user.role != 'admin') res.status(401).json({ msg: 'Not authorized' });
        else {
            let groupCreation = await Group.create(group);
            if(groupCreation){
                return res.status(201).json({ msg: 'Group Added Successfully' });
            }else{
                return res.status(400).json({msg: 'Failed: Add Group Operation'});
            }
        }
    }catch(err) {
		res.status(500).send({'Server Error': err.message});
    }
});

module.exports = router;
