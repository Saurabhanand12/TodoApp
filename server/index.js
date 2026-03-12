const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');

// Config & utils (must be first — validates required env vars)
const { PORT, FRONTEND_URL, isProduction } = require('./config/env');
const dbConnect = require('./config/db');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const { generalRateLimiter } = require('./middleware/rateLimiter');

const app = express();

// ─── Security Middleware ─────────────────────────────────────────────────────

// Set secure HTTP headers
app.use(helmet());

// CORS — tightly scoped to your production frontend + local dev
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    FRONTEND_URL,
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
}));

// ─── Performance Middleware ──────────────────────────────────────────────────

// Gzip compress responses
app.use(compression());

// ─── Parsing Middleware ──────────────────────────────────────────────────────

app.use(cookieParser());
app.use(express.json({ limit: '10kb' })); // Cap request body size

// Sanitize request data to prevent NoSQL injection attacks
app.use(mongoSanitize());

// ─── Rate Limiting ───────────────────────────────────────────────────────────

// General rate limiter on all API routes (login has its own stricter limiter)
app.use('/api', generalRateLimiter);

// ─── Database Connection ─────────────────────────────────────────────────────

// Ensure DB is connected before every request (critical for Vercel serverless)
app.use(async (req, res, next) => {
    try {
        await dbConnect();
        next();
    } catch (err) {
        logger.error('DB connection failed:', err.message);
        res.status(500).json({ success: false, error: 'Database connection failed' });
    }
});

// ─── Routes ──────────────────────────────────────────────────────────────────

app.use('/api/user', require('./routes/users'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/feedback', require('./routes/feedback'));

// Health check
app.get('/', (req, res) => {
    res.json({ success: true, message: 'Todo API is running!', version: '2.0.0' });
});

// 404 handler for unknown routes
app.use((req, res) => {
    res.status(404).json({ success: false, error: `Route ${req.method} ${req.path} not found` });
});

// ─── Global Error Handler (must be last) ─────────────────────────────────────

app.use(errorHandler);

// ─── Start Server (local dev only) ───────────────────────────────────────────

if (!isProduction) {
    app.listen(PORT, () => logger.info(`Server running on http://localhost:${PORT}`));
}

// Export for Vercel serverless
module.exports = app;
