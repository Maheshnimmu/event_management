const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const { auth, checkRole } = require('../middleware/auth');

// Get student profile
router.get('/profile', auth, checkRole(['student']), async (req, res) => {
    try {
        const student = await Student.findById(req.user._id).select('-password');
        res.json(student);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update student profile
router.put('/profile', auth, checkRole(['student']), async (req, res) => {
    try {
        const { name, department } = req.body;
        const student = await Student.findById(req.user._id);

        if (name) student.name = name;
        if (department) student.department = department;

        await student.save();
        res.json(student);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 