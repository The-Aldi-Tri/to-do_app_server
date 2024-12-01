const { createLogger, format, transports } = require("winston");
require("winston-daily-rotate-file");

const rotatingTransport = new transports.DailyRotateFile({
  dirname: "logs",
  filename: "application-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxFiles: 30,
});

const customFormat = format.printf(({ timestamp, level, message, ...rest }) => {
  const jsonMessage = { timestamp, level, message };
  Object.keys(rest).forEach((key) => {
    jsonMessage[key] = rest[key];
  });
  return JSON.stringify(jsonMessage);
});

// Create a Winston logger instance
const logger = createLogger({
  // Set the logging level
  level: "info",

  // Define the format for the logs
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS (UTC Z)" }), // Add a timestamp to each log
    format.errors({ stack: true }), // Format errors to include stack trace
    format.splat(), // Enable string interpolation
    customFormat // Output logs in JSON format
  ),

  // Set default metadata for logs
  // defaultMeta: { service: "express-api-service" },

  // Define the transports for the logs
  transports: [
    // new transports.File({ filename: "combined.log", handleExceptions: true }), // Log all messages to 'combined.log'
    rotatingTransport,
  ],
});

// Show log to console if development
if (process.env.NODE_ENV === "development") {
  logger.add(
    new transports.Console({
      format: format.prettyPrint({ colorize: true }),
      handleExceptions: true,
    })
  );
}

module.exports = logger;
