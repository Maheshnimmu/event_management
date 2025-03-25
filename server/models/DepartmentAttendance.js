const mongoose = require('mongoose');

const departmentAttendanceSchema = new mongoose.Schema({
    department: {
        type: String,
        required: true,
        enum: ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL']
    },
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    eventName: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    students: [{
        name: {
            type: String,
            required: true
        },
        rollno: {
            type: String,
            required: true
        },
        teamName: {
            type: String,
            required: true
        },
        isPresent: {
            type: Boolean,
            required: true
        }
    }]
}, {
    timestamps: true
});

// Ensure unique combination of department and event
departmentAttendanceSchema.index({ department: 1, eventId: 1 }, { unique: true });

const DepartmentAttendance = mongoose.model('DepartmentAttendance', departmentAttendanceSchema);

module.exports = DepartmentAttendance; 