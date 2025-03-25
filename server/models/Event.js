const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    clubId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Club',
        required: true
    },
    eventName: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    teamSize: {
        type: Number,
        required: true,
        min: 1
    },
    fee: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['upcoming', 'ongoing', 'completed'],
        default: 'upcoming'
    },
    registrationsCount: {
        type: Number,
        default: 0
    },
    totalFeesCollected: {
        type: Number,
        default: 0
    },
    isStarted: {
        type: Boolean,
        default: false
    },
    attendance: [{
        registrationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Registration'
        },
        teamName: String,
        members: [{
            name: String,
            rollno: String,
            department: String,
            isPresent: Boolean
        }]
    }]
}, {
    timestamps: true
});

// Update status based on date
eventSchema.pre('save', function (next) {
    const now = new Date();
    if (this.date < now) {
        this.status = 'completed';
    } else if (this.date.toDateString() === now.toDateString()) {
        this.status = 'ongoing';
    }
    next();
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event; 