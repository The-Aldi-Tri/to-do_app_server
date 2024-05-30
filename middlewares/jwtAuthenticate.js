const jwt = require("jsonwebtoken");
const { access_key } = require("../config/jwtConfig");

const jwtAuthenticate = (req, res, next) => {
  // Get token from cookies
  // const token = req.cookies.accessToken;

  // Get token from signed cookies
  const token = req.signedCookies["accessToken"];

  // Check if the token is provided
  if (!token) {
    return res.status(401).json({
      status: "FAILED",
      message: "Authentication failed",
      error: "Token not found",
    });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, access_key);

    // Attach the decoded token to the request object
    req.decoded = decoded;

    // Call the next middleware
    next();
  } catch (error) {
    switch (error.name) {
      case "TokenExpiredError":
        return res.status(401).json({
          status: "FAILED",
          message: "Authentication failed",
          error: "Token has expired",
        });
      case "JsonWebTokenError":
        return res.status(401).json({
          status: "FAILED",
          message: "Authentication failed",
          error: "Token is invalid",
        });
      case "NotBeforeError":
        return res.status(401).json({
          status: "FAILED",
          message: "Authentication failed",
          error: "Token is not yet valid",
        });
      default:
        console.error("Authentication error:", error);
        return res.status(500).json({
          status: "FAILED",
          message: "An unexpected error occurred",
        });
    }
  }
};

module.exports = jwtAuthenticate;
