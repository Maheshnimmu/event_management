const express = require('express');
const router = express.Router();
const Department = require('../models/Department');
const { auth, checkRole } = require('../middleware/auth');

// Get department profile
router.get('/profile', auth, checkRole(['department']), async (req, res) => {
    try {
        const department = await Department.findById(req.user._id).select('-password');
        res.json(department);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update department profile
router.put('/profile', auth, checkRole(['department']), async (req, res) => {
    try {
        const { name, code, head, contactInfo } = req.body;
        const department = await Department.findById(req.user._id);

        if (name) department.name = name;
        if (code) department.code = code;
        if (head) department.head = head;
        if (contactInfo) department.contactInfo = contactInfo;

        await department.save();
        res.json(department);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 