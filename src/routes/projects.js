const express = require('express');
const router = express.Router();
const Projects = require('../models/project');
const User = require('../models/user')
const auth = require('../utils/auth');
const sanitize = require('mongo-sanitize');
const uuidv4= require('uuid/v4')
// @route    GET api/projects
// @desc     Get List of Projects
// @access   Public
router.get('/', async(req, res)=> {
    try{
        const projects = await Projects.find({ });
        return res.json(projects);
    }catch(err){
        console.log(err.message);
        return res.status(500).send('Server Error');
    }
})

// @route    POST api/projects/add
// @desc     add new project
// @access   Private: Only admins can add Projects
router.post('/add', auth, async(req, res)=> {
    const project = sanitize(req.body);
    project.pid = uuidv4();
    try{
        const user = await User.findOne({ uid: req.user.uid }).select('-password');
        if (user.role != 'admin') return res.status(401).json({ msg: 'Not authorized' });
        else {
            let projectCreation = await Projects.create(project);
            if(projectCreation){
                return res.status(201).json({ msg: 'Project Added Successfully' });
            }else{
                return res.status(400).json({msg: 'Failed: Add Project Operation'});
            }
        }
    }catch(err) {
		return res.status(500).send({'Server Error': err.message});
    }
});

// @route    DELETE api/projects/delete/:projectId
// @desc     delete a single project
// @access   Private: only admins can delete projects
router.delete('/delete/:projectId', auth, async (req, res) => {
	const projectId = req.params.projectId;
	try {
		const user = await User.findOne({ uid: req.user.uid }).select('-password');
		if (user.role != 'admin') res.status(404).json({ msg: 'Not authorized' });
		else {
			const deleteProject = await Projects.deleteOne({ pid: projectId });
            if (deleteProject.n>0)
				return res.json({ msg: `Project Deletion Success` });
			else return res.json({ msg: `Error in deleting` });
		}
	} catch (err) {
		console.log('err:', err);
		return res.status(500).send('Server Error:', err);
	}
});

// @route    DELETE api/projects/update/:projectId
// @desc     update a project project
// @access   Private: only admins can update projects
router.put('/update/:projectId',auth,async(req,res)=>{
	const pId=req.params.projectId;
	const project = sanitize(req.body);
	try {
		const user = await User.findOne({ uid: req.user.uid }).select('-password');
		if (user.role != 'admin') res.status(401).json({ msg: 'Not authorized' });
		else {
			let projectUpdation = await Projects.updateOne({'pid':pId},{$set:project})
			if (projectUpdation) {
				return res.status(201).json({ msg: 'Project Updated Successfully' });
			} else {
				return res.status(400).json({ msg: 'Failed: Update Project Operation' });
			}
		}
	} catch (err) {
		res.status(500).send({ 'Server Error': err.message });
	}
})

module.exports = router;
