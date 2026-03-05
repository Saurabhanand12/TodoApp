const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// In server/index.js
const corsOptions = {
    origin: ['http://localhost:5173', 'https://todo-app-frontend-eta-ten.vercel.app'],
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
const usersRouter = require('./routes/users');
const tasksRouter = require('./routes/tasks');

app.use('/api/user', usersRouter);
app.use('/api/tasks', tasksRouter);

// Health check
app.get('/', (req, res) => {
    res.json({ message: 'Todo API is running!' });
});

// Export for Vercel (no app.listen)
module.exports = app;
