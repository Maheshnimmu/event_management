const mongoose = require('mongoose');
const User = require('./User');

const departmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    code: {
        type: String,
        required: true,
        unique: true
    },
    head: {
        name: String,
        email: String,
        designation: String
    },
    contactInfo: {
        phone: String,
        address: String
    }
});

const Department = User.discriminator('Department', departmentSchema);

module.exports = Department; 