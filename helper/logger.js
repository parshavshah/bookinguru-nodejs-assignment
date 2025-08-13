const { createLogger, format, transports } = require('winston');
const path = require('path');

// Create logger instance
const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.errors({ stack: true }),
        format.json(),
        format.printf(({ timestamp, level, message, stack, ...meta }) => {
            let logMessage = `${timestamp} [${level.toUpperCase()}]: ${message}`;

            // Add metadata if present
            if (Object.keys(meta).length > 0) {
                logMessage += ` ${JSON.stringify(meta)}`;
            }

            // Add stack trace for errors
            if (stack) {
                logMessage += `\n${stack}`;
            }

            return logMessage;
        })
    ),
    transports: [
        new transports.File({
            filename: path.join(__dirname, '..', 'logs', 'error.log'),
            level: 'error'
        }),
        new transports.File({
            filename: path.join(__dirname, '..', 'logs', 'combined.log')
        })
    ]
});

// Log to console in development
if (process.env.NODE_ENV !== 'production') {
    logger.add(
        new transports.Console({
            format: format.combine(
                format.colorize(),
                format.simple()
            )
        })
    );
}

module.exports = logger;
