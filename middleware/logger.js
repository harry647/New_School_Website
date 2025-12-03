import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration for logging
const LOG_CONFIG = {
    enableFileLogging: true,
    logLevel: process.env.LOG_LEVEL || 'info', // error, warn, info, debug
    logDirectory: path.join(__dirname, '..', 'logs'),
    maxLogSize: 10 * 1024 * 1024, // 10MB
    maxLogFiles: 5
};

// Ensure log directory exists
if (!fs.existsSync(LOG_CONFIG.logDirectory)) {
    fs.mkdirSync(LOG_CONFIG.logDirectory, { recursive: true });
}

// Log levels
const LOG_LEVELS = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3
};

// Helper to get current timestamp
const getTimestamp = () => new Date().toISOString();

// Helper to format log message
const formatLog = (level, message, meta = {}) => {
    return JSON.stringify({
        timestamp: getTimestamp(),
        level,
        message,
        ...meta
    });
};

// Helper to write to file
const writeToFile = (content) => {
    if (!LOG_CONFIG.enableFileLogging) return;

    const logFile = path.join(LOG_CONFIG.logDirectory, 'app.log');

    try {
        // Check file size and rotate if needed
        if (fs.existsSync(logFile)) {
            const stats = fs.statSync(logFile);
            if (stats.size > LOG_CONFIG.maxLogSize) {
                // Simple rotation: rename current log and create new one
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const archiveFile = path.join(LOG_CONFIG.logDirectory, `app-${timestamp}.log`);
                fs.renameSync(logFile, archiveFile);

                // Clean up old logs
                const files = fs.readdirSync(LOG_CONFIG.logDirectory)
                    .filter(f => f.startsWith('app-') && f.endsWith('.log'))
                    .sort()
                    .reverse();

                if (files.length > LOG_CONFIG.maxLogFiles) {
                    files.slice(LOG_CONFIG.maxLogFiles).forEach(f => {
                        fs.unlinkSync(path.join(LOG_CONFIG.logDirectory, f));
                    });
                }
            }
        }

        fs.appendFileSync(logFile, content + '\n');
    } catch (err) {
        console.error('Failed to write to log file:', err.message);
    }
};

// Logger function
const log = (level, message, meta = {}) => {
    if (LOG_LEVELS[level] > LOG_LEVELS[LOG_CONFIG.logLevel]) return;

    const formatted = formatLog(level, message, meta);

    // Console logging with colors
    const colors = {
        error: '\x1b[31m', // Red
        warn: '\x1b[33m',  // Yellow
        info: '\x1b[36m',  // Cyan
        debug: '\x1b[35m'  // Magenta
    };
    const reset = '\x1b[0m';

    console.log(`${colors[level]}${formatted}${reset}`);

    // File logging
    writeToFile(formatted);
};

// Export logger middleware
export const logger = (req, res, next) => {
    const start = Date.now();
    const originalSend = res.send;

    // Log request
    log('info', 'Request received', {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        sessionId: req.session?.id
    });

    // Override res.send to log response
    res.send = function(data) {
        const duration = Date.now() - start;

        log('info', 'Response sent', {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            contentLength: Buffer.isBuffer(data) ? data.length : (typeof data === 'string' ? data.length : 'unknown')
        });

        originalSend.call(this, data);
    };

    // Log errors if they occur
    res.on('finish', () => {
        if (res.statusCode >= 400) {
            log('warn', 'Error response', {
                method: req.method,
                url: req.url,
                statusCode: res.statusCode
            });
        }
    });

    next();
};

// Export log function for use in other modules
export { log };
