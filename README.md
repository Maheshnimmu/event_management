# Event Management System

A MERN stack application for managing events with role-based authentication.

## Features

- Role-based authentication (Student/Club/Department)
- Responsive navigation
- Protected routes
- Event management
- User management

## Tech Stack

- Frontend: React.js
- Backend: Node.js, Express.js
- Database: MongoDB
- Authentication: JWT

## Project Structure

```
event_m/
├── client/             # Frontend React application
├── server/             # Backend Node.js/Express application
└── README.md
```

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install backend dependencies
   cd server
   npm install

   # Install frontend dependencies
   cd ../client
   npm install
   ```

3. Create a `.env` file in the server directory with:
   ```
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```

4. Start the development servers:
   ```bash
   # Start backend server
   cd server
   npm run dev

   # Start frontend server
   cd client
   npm start
   ```

## API Endpoints

- POST /api/students/register - Student registration
- POST /api/login - Universal login endpoint
- POST /api/clubs/login - Club-specific login
- POST /api/departments/login - Department-specific login 