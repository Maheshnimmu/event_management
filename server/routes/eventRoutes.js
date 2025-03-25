const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const DepartmentAttendance = require('../models/DepartmentAttendance');
const { auth, checkRole } = require('../middleware/auth');
const Department = require('../models/Department');

// Create new event (Club only)
router.post('/', auth, checkRole(['club']), async (req, res) => {
    try {
        const event = new Event({
            ...req.body,
            clubId: req.user._id
        });
        await event.save();
        res.status(201).json(event);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all events for a club
router.get('/club', auth, checkRole(['club']), async (req, res) => {
    try {
        const events = await Event.find({ clubId: req.user._id })
            .sort({ date: 1 });
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all events (for students)
router.get('/', auth, async (req, res) => {
    try {
        const events = await Event.find()
            .populate('clubId', 'name')
            .sort({ date: 1 });
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get event details
router.get('/:id', auth, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('clubId', 'name');
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update event
router.put('/:id', auth, checkRole(['club']), async (req, res) => {
    try {
        const event = await Event.findOne({
            _id: req.params.id,
            clubId: req.user._id
        });
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        Object.assign(event, req.body);
        await event.save();
        res.json(event);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete event
router.delete('/:id', auth, checkRole(['club']), async (req, res) => {
    try {
        const event = await Event.findOneAndDelete({
            _id: req.params.id,
            clubId: req.user._id
        });

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Delete associated department attendance records
        await DepartmentAttendance.deleteMany({ eventId: event._id });

        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get registrations for an event (Club only)
router.get('/:id/registrations', auth, checkRole(['club']), async (req, res) => {
    try {
        const event = await Event.findOne({
            _id: req.params.id,
            clubId: req.user._id
        });
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        const registrations = await Registration.find({ eventId: req.params.id })
            .populate('studentId', 'name studentId department')
            .populate('eventId', 'eventName date description fee status')
            .sort({ createdAt: -1 });

        res.json(registrations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Start event (Club only)
router.post('/:id/start', auth, checkRole(['club']), async (req, res) => {
    try {
        const event = await Event.findOne({
            _id: req.params.id,
            clubId: req.user._id
        });

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Check if event is within 24 hours
        const now = new Date();
        const eventDate = new Date(event.date);
        const hoursDiff = (eventDate - now) / (1000 * 60 * 60);

        if (hoursDiff > 24) {
            return res.status(400).json({ message: 'Event can only be started within 24 hours of the event date' });
        }

        event.isStarted = true;
        event.status = 'ongoing';
        await event.save();

        res.json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Mark attendance (Club only)
router.post('/:id/attendance', auth, checkRole(['club']), async (req, res) => {
    try {
        const event = await Event.findOne({
            _id: req.params.id,
            clubId: req.user._id
        });

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (!event.isStarted) {
            return res.status(400).json({ message: 'Event must be started before marking attendance' });
        }

        const { attendance } = req.body;
        event.attendance = attendance;
        event.status = 'completed';
        await event.save();

        // Create department-specific attendance records
        const departmentAttendanceMap = new Map();

        // Group students by department
        attendance.forEach(team => {
            team.members.forEach(member => {
                if (!departmentAttendanceMap.has(member.department)) {
                    departmentAttendanceMap.set(member.department, {
                        department: member.department,
                        eventId: event._id,
                        eventName: event.eventName,
                        date: event.date,
                        students: []
                    });
                }
                departmentAttendanceMap.get(member.department).students.push({
                    name: member.name,
                    rollno: member.rollno,
                    teamName: team.teamName,
                    isPresent: member.isPresent
                });
            });
        });

        // Save department attendance records
        await Promise.all(
            Array.from(departmentAttendanceMap.values()).map(record =>
                DepartmentAttendance.findOneAndUpdate(
                    { department: record.department, eventId: record.eventId },
                    record,
                    { upsert: true, new: true }
                )
            )
        );

        res.json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get department attendance (Department only)
router.get('/department/:department/attendance', auth, checkRole(['department']), async (req, res) => {
    try {
        const departmentCode = req.params.department;

        // Get the department user's code
        const departmentUser = await Department.findById(req.user._id);
        if (!departmentUser) {
            return res.status(404).json({ message: 'Department user not found' });
        }

        // Verify that the requesting department matches the requested department code
        if (departmentUser.code !== departmentCode) {
            return res.status(403).json({ message: 'Not authorized to view this department\'s attendance' });
        }

        // Get all events that have attendance marked
        const events = await Event.find({
            status: 'completed',
            'attendance.members.department': departmentCode
        }).sort({ date: -1 });

        // Format the attendance data for the department
        const departmentAttendance = events.map(event => {
            const departmentStudents = event.attendance
                .flatMap(team => team.members)
                .filter(member => member.department === departmentCode);

            return {
                eventId: event._id,
                eventName: event.eventName,
                date: event.date,
                students: departmentStudents.map(student => ({
                    name: student.name,
                    rollno: student.rollno,
                    teamName: event.attendance.find(team =>
                        team.members.some(m => m.rollno === student.rollno)
                    )?.teamName,
                    isPresent: student.isPresent
                }))
            };
        });

        res.json(departmentAttendance);
    } catch (error) {
        console.error('Error fetching department attendance:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 