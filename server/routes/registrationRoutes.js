const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const { auth, checkRole } = require('../middleware/auth');

// Register for an event (Student only)
router.post('/:eventId', auth, checkRole(['student']), async (req, res) => {
    try {
        const event = await Event.findById(req.params.eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Check if event is still open for registration
        if (event.status !== 'upcoming') {
            return res.status(400).json({ message: 'Event registration is closed' });
        }

        // Check team size
        if (req.body.teamMembers.length > event.teamSize) {
            return res.status(400).json({
                message: `Team size cannot exceed ${event.teamSize} members`
            });
        }

        // Check if student is already registered
        const existingRegistration = await Registration.findOne({
            eventId: req.params.eventId,
            studentId: req.user._id
        });
        if (existingRegistration) {
            return res.status(400).json({ message: 'You are already registered for this event' });
        }

        const registration = new Registration({
            eventId: req.params.eventId,
            studentId: req.user._id,
            teamName: req.body.teamName,
            teamMembers: req.body.teamMembers.map(member => ({
                name: member.name,
                rollno: member.rollno,
                department: member.department
            }))
        });

        await registration.save();

        // Update event registration count
        event.registrationsCount += 1;
        await event.save();

        // Populate the response with event details
        const populatedRegistration = await Registration.findById(registration._id)
            .populate('eventId', 'eventName date description fee status')
            .populate('studentId', 'name studentId department');

        res.status(201).json(populatedRegistration);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                message: 'Duplicate roll numbers found in team members'
            });
        }
        res.status(500).json({ message: error.message });
    }
});

// Get student's registrations
router.get('/student', auth, checkRole(['student']), async (req, res) => {
    try {
        const registrations = await Registration.find({ studentId: req.user._id })
            .populate('eventId', 'eventName date description fee status')
            .populate('studentId', 'name studentId department')
            .sort({ createdAt: -1 });
        res.json(registrations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update payment status (Club only)
router.patch('/:id/payment', auth, checkRole(['club']), async (req, res) => {
    try {
        const registration = await Registration.findById(req.params.id)
            .populate('eventId');

        if (!registration) {
            return res.status(404).json({ message: 'Registration not found' });
        }

        // Verify the event belongs to the club
        if (registration.eventId.clubId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        registration.paymentStatus = req.body.paymentStatus;
        await registration.save();

        // Update total fees collected if payment is completed
        if (req.body.paymentStatus === 'completed') {
            registration.eventId.totalFeesCollected += registration.eventId.fee;
            await registration.eventId.save();
        }

        res.json(registration);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 