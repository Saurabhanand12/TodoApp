/**
 * Production-safe logger.
 * Suppresses all output in production to prevent sensitive data leaks.
 * In development, outputs with a timestamp prefix.
 */
const isProduction = process.env.NODE_ENV === 'production';

const logger = {
    info: (...args) => {
        if (!isProduction) console.log('[INFO]', new Date().toISOString(), ...args);
    },
    warn: (...args) => {
        if (!isProduction) console.warn('[WARN]', new Date().toISOString(), ...args);
    },
    error: (...args) => {
        // Always log errors, but strip sensitive detail in production
        if (isProduction) {
            console.error('[ERROR]', new Date().toISOString(), args[0]);
        } else {
            console.error('[ERROR]', new Date().toISOString(), ...args);
        }
    },
};

module.exports = logger;
