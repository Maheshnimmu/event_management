const express = require('express');
const router = express.Router();
const Club = require('../models/Club');
const { auth, checkRole } = require('../middleware/auth');

// Get club profile
router.get('/profile', auth, checkRole(['club']), async (req, res) => {
    try {
        const club = await Club.findById(req.user._id).select('-password');
        res.json(club);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update club profile
router.put('/profile', auth, checkRole(['club']), async (req, res) => {
    try {
        const { name, description, category, facultyAdvisor } = req.body;
        const club = await Club.findById(req.user._id);

        if (name) club.name = name;
        if (description) club.description = description;
        if (category) club.category = category;
        if (facultyAdvisor) club.facultyAdvisor = facultyAdvisor;

        await club.save();
        res.json(club);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Add member to club
router.post('/members', auth, checkRole(['club']), async (req, res) => {
    try {
        const { studentId, role } = req.body;
        const club = await Club.findById(req.user._id);

        club.members.push({ studentId, role });
        await club.save();

        res.json(club);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 