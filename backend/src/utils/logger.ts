import winston from "winston";
import fs from "fs";
import path from "path";
import cron from "node-cron";

// Define log format
const logFormat = winston.format.printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});

// Correct path to the logs directory (backend/logs)
const logDirectory = path.join(__dirname, "..", "logs");  

// Create a logger instance
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    logFormat
  ),
  transports: [
    // Log to the console
    new winston.transports.Console(),
    // Log to a file
    new winston.transports.File({ filename: path.join(logDirectory, "error.log"), level: "error" }), // Log errors to a file
    new winston.transports.File({ filename: path.join(logDirectory, "combined.log") }), // Log all levels to a file
  ],
});

// Create the logs directory if it doesn't exist
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
  logger.info(`Created logs directory at ${logDirectory}`);
}

// Function to delete old log files
const deleteOldLogs = (directory: string, maxAgeInDays: number) => {
  const now = Date.now();
  const maxAgeInMs =    maxAgeInDays * 24 * 60 * 60 * 1000;
  fs.readdir(directory, (err, files) => {
    if (err) {
      logger.error(`Error reading directory ${directory}: ${err}`);
      return;
    }

    files.forEach(file => {
      const filePath = path.join(directory, file);
      fs.stat(filePath, (err, stats) => {
        if (err) {
          logger.error(`Error getting stats of file ${filePath}: ${err}`);
          return;
        }

        // Check if the file is older than maxAgeInMinutes
        if (now - stats.mtimeMs > maxAgeInMs) {
          fs.unlink(filePath, err => {
            if (err) {
              logger.error(`Error deleting file ${filePath}: ${err}`);
            } else {
              logger.info(`Deleted old log file: ${filePath}`);
            }
          });
        }
      });
    });
  });
};

 
cron.schedule("* * * * *", () => {
  const maxAgeInMinutes =4;  
  deleteOldLogs(logDirectory, maxAgeInMinutes);
});

export default logger;