const mongoose = require("mongoose");
const logger = require("../logger");

const errorHandler = (err, req, res) => {
  // JWT errors
  const jwtErrors = [
    "TokenExpiredError",
    "JsonWebTokenError",
    "NotBeforeError",
  ];
  if (jwtErrors.includes(err.name)) {
    logger.error("Authentication failed:", err);
    return res.status(401).json({
      message: "Authentication failed",
      error: err.message,
    });
  }

  // JOI errors
  if (err.isJoi || err.name === "ValidationError") {
    const errors = err.details.map((detail) =>
      detail.message.replace(/['"]/g, "").replace(/[_]/g, " ")
    );
    logger.error("Data validation failed:", err);
    return res.status(422).json({
      message: "Data validation failed",
      error: errors,
    });
  }

  // Mongoose errors
  if (err instanceof mongoose.Error || err.code === 11000) {
    // Duplicate error
    if (err.code === 11000) {
      const duplicatedFields = Object.keys(err.keyPattern);
      logger.error("Duplicate error:", err);
      return res.status(422).json({
        message: `This ${duplicatedFields} is already in use`,
      });
    }

    // Other errors
    logger.error("Mongoose error:", err);
    return res.status(400).json({
      message: err.name,
      error: err.message,
    });
  }

  logger.error("An unexpected error occurred:", err);
  return res.status(500).json({
    message: "An unexpected error occurred",
  });
};

module.exports = errorHandler;
