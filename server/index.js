const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
const corsOptions = {
    origin: ['http://localhost:5173', 'https://todo-app-frontend-eta-ten.vercel.app'],
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
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

// Health check
app.get('/', (req, res) => {
    res.json({ message: 'Todo API is running!' });
});

// Start server locally (not on Vercel)
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

// Export for Vercel serverless
module.exports = app;
