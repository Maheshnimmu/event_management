const mongoose = require('mongoose');
const Club = require('../models/Club');
const Department = require('../models/Department');
const dotenv = require('dotenv');

dotenv.config();

const createDummyData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Create dummy club
        const club = new Club({
            email: 'acm@gmail.com',
            password: '123456',
            role: 'club',
            name: 'ACM Club',
            description: 'Association for Computing Machinery',
            category: 'Technology',
            facultyAdvisor: {
                name: 'Dr. John Doe',
                email: 'john.doe@university.edu'
            }
        });

        // Create dummy department
        const department = new Department({
            email: 'cse@gmail.com',
            password: '123456',
            role: 'department',
            name: 'Computer Science and Engineering',
            code: 'CSE',
            head: {
                name: 'Dr. Jane Smith',
                email: 'jane.smith@university.edu',
                designation: 'Department Head'
            },
            contactInfo: {
                phone: '+1-234-567-8900',
                address: 'Engineering Building, Room 101'
            }
        });

        // Save the data
        await club.save();
        await department.save();

        console.log('Dummy data created successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error creating dummy data:', error);
        process.exit(1);
    }
};

createDummyData(); 