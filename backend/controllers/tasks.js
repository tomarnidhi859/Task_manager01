const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc    Get tasks for a project
// @route   GET /api/projects/:projectId/tasks
// @access  Private
exports.getTasks = async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.projectId);

        if (!project) {
            return res.status(404).json({ success: false, error: 'Project not found' });
        }

        // Make sure user is project owner or member
        if (project.owner.toString() !== req.user.id && !project.members.includes(req.user.id)) {
            return res.status(403).json({ success: false, error: 'Not authorized to view tasks for this project' });
        }

        const tasks = await Task.find({ project: req.params.projectId })
            .populate('assignee', 'name email avatar')
            .populate('createdBy', 'name email avatar');

        res.status(200).json({ success: true, count: tasks.length, data: tasks });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
exports.getTask = async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate('assignee', 'name email avatar')
            .populate('project', 'name members owner');

        if (!task) {
            return res.status(404).json({ success: false, error: 'Task not found' });
        }

        // Make sure user is project member
        if (task.project.owner.toString() !== req.user.id && !task.project.members.some(m => m.toString() === req.user.id)) {
            return res.status(403).json({ success: false, error: 'Not authorized to view this task' });
        }

        res.status(200).json({ success: true, data: task });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Create new task
// @route   POST /api/projects/:projectId/tasks
// @access  Private (Admin/Owner)
exports.createTask = async (req, res, next) => {
    try {
        req.body.project = req.params.projectId;
        req.body.createdBy = req.user.id;

        const project = await Project.findById(req.params.projectId);

        if (!project) {
            return res.status(404).json({ success: false, error: 'Project not found' });
        }

        // Make sure user is project owner or admin
        if (project.owner.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Not authorized to add task to this project' });
        }

        // If assignee is provided, check if they are a member
        if (req.body.assignee && !project.members.includes(req.body.assignee)) {
            return res.status(400).json({ success: false, error: 'Assignee must be a project member' });
        }

        const task = await Task.create(req.body);

        res.status(201).json({ success: true, data: task });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res, next) => {
    try {
        let task = await Task.findById(req.params.id).populate('project', 'owner members');

        if (!task) {
            return res.status(404).json({ success: false, error: 'Task not found' });
        }

        // Make sure user is owner, admin, or the assignee
        const isOwner = task.project.owner.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';
        const isAssignee = task.assignee && task.assignee.toString() === req.user.id;

        if (!isOwner && !isAdmin && !isAssignee) {
            return res.status(403).json({ success: false, error: 'Not authorized to update this task' });
        }

        // If non-owner/admin tries to update things other than status, block it
        if (!isOwner && !isAdmin) {
            // Assignee can only update status
            const allowedUpdates = ['status'];
            const updates = Object.keys(req.body);
            const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

            if (!isValidOperation) {
                return res.status(400).json({ success: false, error: 'You can only update the task status' });
            }
        }

        task = await Task.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: task });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id).populate('project', 'owner');

        if (!task) {
            return res.status(404).json({ success: false, error: 'Task not found' });
        }

        // Make sure user is project owner or admin
        if (task.project.owner.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Not authorized to delete task' });
        }

        await task.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get dashboard stats
// @route   GET /api/tasks/dashboard/stats
// @access  Private
exports.getDashboardStats = async (req, res, next) => {
    try {
        // Find projects user is part of
        const projects = await Project.find({
            $or: [{ owner: req.user.id }, { members: req.user.id }]
        });

        const projectIds = projects.map(p => p._id);

        // Get stats for tasks in these projects OR assigned to user
        const stats = await Task.aggregate([
            {
                $match: {
                    $or: [
                        { project: { $in: projectIds } },
                        { assignee: req.user._id }
                    ]
                }
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const formattedStats = {
            todo: 0,
            'in-progress': 0,
            done: 0,
            overdue: 0,
            total: 0
        };

        stats.forEach(stat => {
            formattedStats[stat._id] = stat.count;
            formattedStats.total += stat.count;
        });

        res.status(200).json({ success: true, data: formattedStats });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
