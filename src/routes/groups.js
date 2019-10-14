const express = require('express');
const router = express.Router();
const Group = require('../models/groups');

router.get('/', async(req, res)=> {
    try{
        const groups = await Group.find({ });
        res.json(groups);
    }catch(err){
        console.log(err.message);
        res.status(500).send('Server Error');
    }
})

module.exports = router;
