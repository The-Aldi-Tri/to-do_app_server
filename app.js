require("dotenv").config({
  path: [".env.base", `.env.${process.env.NODE_ENV}`],
  override: true,
}); // Load environment variables
const express = require("express");
// const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const connectDb = require("./connections/databaseConnection");
const apiLimiter = require("./middlewares/apiLimiter");
const apiRouter = require("./routes/indexRoute");
const errorHandler = require("./middlewares/errorHandler");
const { v4: uuid_v4 } = require("uuid");
const logger = require("./logger");

const app = express();

// Connect to database
connectDb();

// Helps secure app by setting HTTP response headers.
app.use(helmet());

// Handle cross-origin requests
if (process.env.NODE_ENV === "development") {
  app.use(
    cors({
      origin: ["http://localhost:3000"], // Allow requests from specific origin
      credentials: true, // Allow credentials (cookies, authorization headers)
    })
  );
}

// Request body parser using built-in
app.use(express.json()); // Parse JSON bodies
//app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Request cookie parser
app.use(cookieParser(process.env.COOKIE_SECRET_KEY)); // Sign cookie to ensure cookie integrity

// Middleware to log incoming requests
app.use((req, res, next) => {
  req.startTime = Date.now(); // Get current time
  req.requestId = uuid_v4(); // Generate a unique request ID

  const body = { ...req.body };
  if (body.password) body.password = "[REDACTED]";

  const logObj = {
    requestId: req.requestId,
    requestBody: body,
  };

  logger.info(
    "Incoming request: %s %s from %s",
    req.method,
    req.url,
    req.ip,
    logObj
  );
  next();
});

// Serve static files (ONLY USE THIS IN DEV, NGINX IS BETTER AT THIS)
// app.use(express.static(path.join(__dirname, "../client/build")));

// Apply rate limit to api routes
app.use("/api", apiLimiter);

// Mount api routes
apiRouter(app);

// Middleware to handle invalid/not defined routes
app.use((req, res, next) => {
  // Check if previous middleware has built response
  if (res.locals.status) return next();

  res.locals.status = 404;
  res.locals.json = {
    message: "Invalid route or method",
  };
  next();
});

// Middleware to return and log response
app.use((req, res) => {
  const responseTime = Date.now() - req.startTime;

  logger.log(
    res.locals.status >= 300 ? "warn" : "info",
    "Returning response: %s %s to %s",
    req.method,
    req.url,
    req.ip,
    {
      requestId: req.requestId,
      responseTime: `${responseTime} ms`,
      responseStatus: res.locals.status,
      responseBody: res.locals.json,
    }
  );

  return res.status(res.locals.status).json(res.locals.json);
});

// Handle errors
app.use(errorHandler);

// Handle client-side routing (ONLY USE THIS IN DEV, NGINX IS BETTER AT THIS)
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "../client/build", "index.html"));
// });

// Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  logger.info(`Server started in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
