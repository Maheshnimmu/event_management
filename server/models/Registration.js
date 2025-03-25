const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    rollno: {
        type: String,
        required: true,
        trim: true
    },
    department: {
        type: String,
        required: true,
        enum: ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL']
    }
});

const registrationSchema = new mongoose.Schema({
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    teamName: {
        type: String,
        required: true,
        trim: true
    },
    teamMembers: [teamMemberSchema],
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed'],
        default: 'pending'
    }
}, {
    timestamps: true
});

// Ensure unique roll numbers per event
registrationSchema.index({ eventId: 1, 'teamMembers.rollno': 1 }, { unique: true });

const Registration = mongoose.model('Registration', registrationSchema);

module.exports = Registration; 