const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dbConnect = require('./lib/db');
require('dotenv').config();

const app = express();

// Middleware
const corsOptions = {
    origin: ['http://localhost:5173', 'https://todo-app-frontend-eta-ten.vercel.app'],
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

// Ensure DB is connected before every request (critical for Vercel serverless)
app.use(async (req, res, next) => {
    try {
        await dbConnect();
        next();
    } catch (err) {
        console.error('DB connection failed:', err);
        res.status(500).json({ error: 'Database connection failed' });
    }
});

// Routes
const usersRouter = require('./routes/users');
const tasksRouter = require('./routes/tasks');
const feedbackRouter = require('./routes/feedback');

app.use('/api/user', usersRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/feedback', feedbackRouter);

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
