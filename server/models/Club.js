const mongoose = require('mongoose');
const User = require('./User');

const clubSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    facultyAdvisor: {
        name: String,
        email: String
    },
    members: [{
        studentId: String,
        role: {
            type: String,
            enum: ['member', 'officer', 'admin'],
            default: 'member'
        }
    }]
});

const Club = User.discriminator('Club', clubSchema);

module.exports = Club; 