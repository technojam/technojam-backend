const express = require('express');
const router = express.Router();
const Projects = require('../models/project');
const User = require('../models/user')
const auth = require('../utils/auth');
const sanitize = require('mongo-sanitize');

// @route    GET api/projects
// @desc     Get List of Projects
// @access   Public
router.get('/', async (req, res) => {
    try {
        const projects = await Projects.find({});
        return res.json(projects);
    } catch (err) {
        console.log(err.message);
        return res.status(500).send('Server Error');
    }
})

// @route    POST api/projects/add
// @desc     add new project
// @access   Private: Only admins can add Projects
router.post('/add', auth, async (req, res) => {
    const project = sanitize(req.body);
    try {
        const user = await User.findOne({ uid: req.user.uid }).select('-password');
        if (user.role != 'admin') return res.status(401).json({ code: 'PROJECTS_ADD_UNAUTHORISED', msg: 'Not authorized' });
        else {
            let projectCreation = await Projects.create(project);
            if (projectCreation) {
                return res.status(201).json({ code: 'PROJECTS_ADD_DONE', msg: 'Project Added Successfully' });
            } else {
                return res.status(400).json({ code: 'PROJECTS_ADD_FAILED', msg: 'Failed: Add Project Operation' });
            }
        }
    } catch (err) {
        return res.status(500).send({ 'Server Error': err.message });
    }
});

// @route    DELETE api/projects/:projectId/delete
// @desc     delete a single project
// @access   Private: only admins can delete projects
router.delete('/:projectId/delete', auth, async (req, res) => {
    const projectId = req.params.projectId;
    try {
        const user = await User.findOne({ uid: req.user.uid }).select('-password');
        if (user.role != 'admin') res.status(401).json({ code: 'PROJECTS_DELETE_UNAUTHORISED', msg: 'Not authorized' });
        else {
            const deleteProject = await Projects.deleteOne({ pid: projectId });
            if (deleteProject.n > 0)
                return res.json({ code: 'PROJECTS_DELETE_DONE', msg: `Project Deletion Success` });
            else return res.json({ code: 'PROJECTS_DELETE_FAILED', msg: `Error in deleting` });
        }
    } catch (err) {
        console.log('err:', err);
        return res.status(500).send('Server Error:', err);
    }
});

module.exports = router;
