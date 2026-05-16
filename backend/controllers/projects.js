const Project = require('../models/Project');
const User = require('../models/User');

// @desc    Get all projects for logged in user
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res, next) => {
    try {
        // Find projects where user is owner or in members array
        const projects = await Project.find({
            $or: [{ owner: req.user.id }, { members: req.user.id }]
        }).populate('owner', 'name email avatar').populate('members', 'name email avatar');

        res.status(200).json({ success: true, count: projects.length, data: projects });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private (Owner or Member)
exports.getProject = async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('owner', 'name email avatar')
            .populate('members', 'name email avatar');

        if (!project) {
            return res.status(404).json({ success: false, error: 'Project not found' });
        }

        // Check if user is owner or member
        if (project.owner._id.toString() !== req.user.id && !project.members.some(m => m._id.toString() === req.user.id)) {
            return res.status(403).json({ success: false, error: 'Not authorized to access this project' });
        }

        res.status(200).json({ success: true, data: project });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private/Admin
exports.createProject = async (req, res, next) => {
    try {
        req.body.owner = req.user.id;
        
        // Add owner to members by default
        req.body.members = [req.user.id];

        const project = await Project.create(req.body);

        res.status(201).json({ success: true, data: project });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private/Admin/Owner
exports.updateProject = async (req, res, next) => {
    try {
        let project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ success: false, error: 'Project not found' });
        }

        // Make sure user is project owner
        if (project.owner.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Not authorized to update this project' });
        }

        project = await Project.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: project });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private/Admin/Owner
exports.deleteProject = async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ success: false, error: 'Project not found' });
        }

        if (project.owner.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Not authorized to delete this project' });
        }

        await project.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Add member to project
// @route   POST /api/projects/:id/members
// @access  Private/Admin/Owner
exports.addMember = async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ success: false, error: 'Project not found' });
        }

        if (project.owner.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Not authorized to add members' });
        }

        const { email } = req.body;
        const userToAdd = await User.findOne({ email });

        if (!userToAdd) {
            return res.status(404).json({ success: false, error: 'User not found with this email' });
        }

        if (project.members.includes(userToAdd._id)) {
            return res.status(400).json({ success: false, error: 'User is already a member' });
        }

        project.members.push(userToAdd._id);
        await project.save();

        res.status(200).json({ success: true, data: project });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Remove member from project
// @route   DELETE /api/projects/:id/members/:userId
// @access  Private/Admin/Owner
exports.removeMember = async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ success: false, error: 'Project not found' });
        }

        if (project.owner.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Not authorized to remove members' });
        }

        // Cannot remove the owner
        if (req.params.userId === project.owner.toString()) {
            return res.status(400).json({ success: false, error: 'Cannot remove the project owner' });
        }

        project.members = project.members.filter(
            m => m.toString() !== req.params.userId
        );
        await project.save();

        res.status(200).json({ success: true, data: project });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
