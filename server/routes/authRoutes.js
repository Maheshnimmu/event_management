const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Club = require('../models/Club');
const Department = require('../models/Department');
const { auth } = require('../middleware/auth');

// Universal login endpoint
router.post('/login', async (req, res) => {
    try {
        const { email, password, role } = req.body;

        let user;
        switch (role) {
            case 'student':
                user = await Student.findOne({ email });
                break;
            case 'club':
                user = await Club.findOne({ email });
                break;
            case 'department':
                user = await Department.findOne({ email });
                break;
            default:
                return res.status(400).json({ message: 'Invalid role' });
        }

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '24h'
        });

        res.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                ...(role === 'student' && { name: user.name, studentId: user.studentId, department: user.department }),
                ...(role === 'club' && { name: user.name, category: user.category }),
                ...(role === 'department' && { name: user.name, code: user.code, department: user.code })
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Student registration
router.post('/students/register', async (req, res) => {
    try {
        const { email, password, name, studentId, department } = req.body;

        // Check if student already exists
        const existingStudent = await Student.findOne({
            $or: [{ email }, { studentId }]
        });

        if (existingStudent) {
            return res.status(400).json({
                message: 'Student with this email or ID already exists'
            });
        }

        const student = new Student({
            email,
            password,
            name,
            studentId,
            department,
            role: 'student'
        });

        await student.save();

        const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET, {
            expiresIn: '24h'
        });

        res.status(201).json({
            token,
            user: {
                id: student._id,
                email: student.email,
                name: student.name,
                studentId: student.studentId,
                department: student.department,
                role: 'student'
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get current user
router.get('/me', auth, async (req, res) => {
    try {
        const user = req.user;
        res.json({
            id: user._id,
            email: user.email,
            role: user.role,
            ...(user.role === 'student' && {
                name: user.name,
                studentId: user.studentId,
                department: user.department
            }),
            ...(user.role === 'club' && {
                name: user.name,
                category: user.category,
                description: user.description
            }),
            ...(user.role === 'department' && {
                name: user.name,
                code: user.code,
                department: user.code,
                head: user.head
            })
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 