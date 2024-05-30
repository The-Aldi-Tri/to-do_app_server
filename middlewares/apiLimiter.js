const rateLimit = require("express-rate-limit");

// Define rate limit rules
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 requests per `windowMs`
  statusCode: 429, // Too Many Requests status code
  message: "Too many requests from this IP, please try again after a minute",
});

module.exports = apiLimiter;
