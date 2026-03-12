require('dotenv').config();

// Warn about missing env vars instead of throwing synchronously.
// A hard throw here crashes the module before Express CORS middleware
// is registered, causing all preflight requests to return no CORS headers.
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];

for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        // In production log to stderr so Vercel captures it in function logs
        console.error(`[STARTUP ERROR] Missing required environment variable: ${envVar}. Set it in the Vercel dashboard.`);
    }
}

module.exports = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT, 10) || 5000,
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    FRONTEND_URL: process.env.FRONTEND_URL || 'https://todo-app-frontend-saurabh-anand-s-projects-3b82a62b.vercel.app',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    isProduction: process.env.NODE_ENV === 'production',
};
