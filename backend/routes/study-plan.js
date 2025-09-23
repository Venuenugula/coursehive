const express = require('express');
const { body, validationResult } = require('express-validator');
const StudyPlan = require('../models/StudyPlan');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/study-plan
// @desc    Get user's study plan for today
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let studyPlan = await StudyPlan.findOne({
      user: req.user._id,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    // If no study plan exists for today, create one
    if (!studyPlan) {
      studyPlan = new StudyPlan({
        user: req.user._id,
        tasks: [],
        date: today
      });
      await studyPlan.save();
    }

    res.json({
      studyPlan,
      tasks: studyPlan.tasks
    });
  } catch (error) {
    console.error('Get study plan error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/study-plan/tasks
// @desc    Add a new task to study plan
// @access  Private
router.post('/tasks', [
  auth,
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('subject').optional().trim(),
  body('duration').optional().isInt({ min: 1 }).withMessage('Duration must be a positive integer'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority level'),
  body('time').optional().trim(),
  body('description').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let studyPlan = await StudyPlan.findOne({
      user: req.user._id,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    // If no study plan exists for today, create one
    if (!studyPlan) {
      studyPlan = new StudyPlan({
        user: req.user._id,
        tasks: [],
        date: today
      });
    }

    const newTask = {
      title: req.body.title,
      description: req.body.description || '',
      subject: req.body.subject || '',
      duration: req.body.duration || 30,
      priority: req.body.priority || 'medium',
      time: req.body.time || '',
      completed: false
    };

    studyPlan.tasks.push(newTask);
    await studyPlan.save();

    res.status(201).json({
      message: 'Task added successfully',
      task: newTask
    });
  } catch (error) {
    console.error('Add task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/study-plan/tasks/:taskId
// @desc    Update a task in study plan
// @access  Private
router.put('/tasks/:taskId', [
  auth,
  body('title').optional().trim().isLength({ min: 1 }).withMessage('Title cannot be empty'),
  body('subject').optional().trim(),
  body('duration').optional().isInt({ min: 1 }).withMessage('Duration must be a positive integer'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority level'),
  body('time').optional().trim(),
  body('description').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const studyPlan = await StudyPlan.findOne({
      user: req.user._id,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    if (!studyPlan) {
      return res.status(404).json({ message: 'Study plan not found' });
    }

    const task = studyPlan.tasks.id(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Update task fields
    if (req.body.title) task.title = req.body.title;
    if (req.body.description !== undefined) task.description = req.body.description;
    if (req.body.subject !== undefined) task.subject = req.body.subject;
    if (req.body.duration) task.duration = req.body.duration;
    if (req.body.priority) task.priority = req.body.priority;
    if (req.body.time !== undefined) task.time = req.body.time;

    await studyPlan.save();

    res.json({
      message: 'Task updated successfully',
      task
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH /api/users/study-plan/tasks/:taskId/toggle
// @desc    Toggle task completion status
// @access  Private
router.patch('/tasks/:taskId/toggle', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const studyPlan = await StudyPlan.findOne({
      user: req.user._id,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    if (!studyPlan) {
      return res.status(404).json({ message: 'Study plan not found' });
    }

    const task = studyPlan.tasks.id(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.completed = !task.completed;
    if (task.completed) {
      task.completedAt = new Date();
    } else {
      task.completedAt = undefined;
    }

    await studyPlan.save();

    res.json({
      message: 'Task status updated successfully',
      task
    });
  } catch (error) {
    console.error('Toggle task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/users/study-plan/tasks/:taskId
// @desc    Delete a task from study plan
// @access  Private
router.delete('/tasks/:taskId', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const studyPlan = await StudyPlan.findOne({
      user: req.user._id,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    if (!studyPlan) {
      return res.status(404).json({ message: 'Study plan not found' });
    }

    const task = studyPlan.tasks.id(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.remove();
    await studyPlan.save();

    res.json({
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
