const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
const usersRouter = require('./routes/users');
const tasksRouter = require('./routes/tasks');

app.use('/api/user', usersRouter);
app.use('/api/tasks', tasksRouter);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
