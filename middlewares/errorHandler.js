const mongoose = require("mongoose");

const errorHandler = (err, req, res, next) => {
  // JWT errors
  const jwtErrors = [
    "TokenExpiredError",
    "JsonWebTokenError",
    "NotBeforeError",
  ];
  if (jwtErrors.includes(err.name)) {
    return res.status(401).json({
      status: "FAILED",
      message: "Authentication failed",
      error: err.message,
    });
  }

  // JOI errors
  if (err.isJoi || err.name === "ValidationError") {
    const errors = err.details.map((detail) =>
      detail.message.replace(/['"]/g, "").replace(/[_]/g, " ")
    );
    return res.status(422).json({
      status: "FAILED",
      message: "Data validation failed",
      error: errors,
    });
  }

  // Mongoose errors
  if (err instanceof mongoose.Error || err.code === 11000) {
    // Duplicate error
    if (err.code === 11000) {
      const duplicatedFields = Object.keys(err.keyPattern);
      return res.status(422).json({
        status: "FAILED",
        message: `This ${duplicatedFields} is already in use`,
      });
    }

    // Other errors
    return res.status(400).json({
      status: "FAILED",
      message: err.name,
      error: err.message,
    });
  }

  return res.status(500).json({
    status: "FAILED",
    message: "An unexpected error occurred",
  });
};

module.exports = errorHandler;
