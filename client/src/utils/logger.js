// Secure logger utility — only logs in development mode
const isDev = import.meta.env.DEV;

const logger = {
  log: (...args) => { },
  info: (...args) => { if (isDev) console.info(...args); },
  warn: (...args) => { if (isDev) console.warn(...args); },
  error: (...args) => { console.error(...args); }, // Always log errors
};

export default logger;
