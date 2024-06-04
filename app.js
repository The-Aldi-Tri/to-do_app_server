require("dotenv").config(); // Load environment variables from .env file
const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const connectDb = require("./connections/databaseConnection");
const apiLimiter = require("./middlewares/apiLimiter");
const apiRouter = require("./routes/indexRoute");

// Connect to database
connectDb();

// Helps secure app by setting HTTP response headers.
app.use(helmet());

// Handle cross-origin requests
// app.use(
//   cors({
//     origin: ["http://localhost:3000"], // Allow requests from specific origin
//     credentials: true, // Allow credentials (cookies, authorization headers)
//   })
// );

// Request body parser using built-in
app.use(express.json()); // Parse JSON bodies
//app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Request cookie parser
app.use(cookieParser(process.env.COOKIE_SECRET_KEY)); // Ensure cookie integrity

// Serve static files (ONLY USE THIS IN DEV, NGINX IS BETTER AT THIS)
app.use(express.static(path.join(__dirname, "../client/build")));

// Apply rate limit to api routes
app.use("/api", apiLimiter);

// Mount api routes
apiRouter(app);

// Handle client-side routing (ONLY USE THIS IN DEV, NGINX IS BETTER AT THIS)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});

// Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running ${process.env.NODE_ENV} on port ${PORT}`);
});
