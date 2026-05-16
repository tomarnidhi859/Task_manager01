const express = require('express');
const {
    getProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject,
    addMember,
    removeMember
} = require('../controllers/projects');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// All project routes are protected
router.use(protect);

router.route('/')
    .get(getProjects)
    .post(authorize('admin'), createProject); // Only admin can create project

router.route('/:id')
    .get(getProject)
    .put(updateProject)
    .delete(deleteProject);

router.post('/:id/members', addMember);
router.delete('/:id/members/:userId', removeMember);

module.exports = router;
