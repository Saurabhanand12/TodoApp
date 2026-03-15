// ── Load .env FIRST — before anything else ──────────────────────────────────
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');

// ── CORS & Helmet set up using process.env DIRECTLY (not via config module) ──
// This must happen before any require() that could throw, so that ALL
// responses — including startup-error 500s — carry the correct CORS headers.
const FRONTEND_URL =
    process.env.FRONTEND_URL ||
    'https://todo-app-twq2.vercel.app';

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    FRONTEND_URL,
    'https://todo-app-twq2.vercel.app',
    'https://todo-app-twq2-k4qwqa3k2-saurabh-anand-s-projects-3b82a62b.vercel.app',
    'https://todo-app-frontend-kohl.vercel.app',
];

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl) or if in allowed list
        if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'Cookie'],
    optionsSuccessStatus: 200,
};

const app = express();

// ─── CORS headers set FIRST — raw, before any middleware that can fail ────────
// This guarantees Access-Control-Allow-Origin on ALL responses, including 500s.
app.use((req, res, next) => {
    const origin = req.headers.origin;
    // Set Access-Control-Allow-Origin dynamically if it's in our allowed list
    if (origin && (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app'))) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (!origin) {
        // Fallback for requests without origin (like same-origin or non-browser)
        res.setHeader('Access-Control-Allow-Origin', FRONTEND_URL);
    }
    
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

// ─── Security Middleware ─────────────────────────────────────────────────────

// Set secure HTTP headers (crossOriginResourcePolicy relaxed for API use)
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CORS via library (for full compliance — our manual headers above are the safety net)
app.use(cors(corsOptions));

// ── Config & utils (loaded AFTER CORS is registered) ─────────────────────────
const { PORT, isProduction } = require('./config/env');
const dbConnect = require('./config/db');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const { generalRateLimiter } = require('./middleware/rateLimiter');


// ─── Performance Middleware ──────────────────────────────────────────────────

// Gzip compress responses
app.use(compression());

// ─── Parsing Middleware ──────────────────────────────────────────────────────

app.use(cookieParser());
app.use(express.json({ limit: '10kb' })); // Cap request body size

// ── NoSQL Injection Sanitizer (Express 5 compatible) ─────────────────────────
// express-mongo-sanitize crashes on Express 5 — req.query is read-only there.
// This custom sanitizer only touches req.body (the real injection attack surface).
const sanitizeObject = (obj) => {
    if (obj && typeof obj === 'object') {
        for (const key of Object.keys(obj)) {
            if (key.startsWith('$') || key.includes('.')) {
                delete obj[key];
            } else {
                sanitizeObject(obj[key]);
            }
        }
    }
};
app.use((req, res, next) => {
    if (req.body) sanitizeObject(req.body);
    next();
});

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

// Vercel automatically sets process.env.VERCEL to "1"
if (!process.env.VERCEL && !isProduction) {
    const port = PORT || 5000;
    app.listen(port, () => logger.info(`Server running on http://localhost:${port}`));
}

// Export for Vercel serverless
module.exports = app;

