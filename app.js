require("dotenv").config(); // Load environment variables from .env file
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const router = require("./routes/indexRoute");
const connectDb = require("./connections/databaseConnection");

// Connect to database
const db = connectDb();

// Body parser
app.use(bodyParser.json()); // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies
// Use cookie-parser middleware
app.use(cookieParser());
// Enable cors
app.use(cors({ origin: "*" }));

// // Serve static files
// const absolutePath = express.static(
//   path.join(__dirname, "..", "client", "build")
// );
// app.use('/build', absolutePath)

// Mount Routes
router(app);

// Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
