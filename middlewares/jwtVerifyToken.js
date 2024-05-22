const jwt = require("jsonwebtoken");
const { access_key } = require("../config/jwtConfig");

const jwtVerifyToken = (req, res, next) => {
  // Get the token from the request headers or cookies
  const token =
    req.headers.authorization?.split(" ")[1] || req.cookies.accessToken;

  // Check if the token is provided
  if (!token) {
    return res
      .status(401)
      .json({ status: "Fail", message: "Access token not provided" });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, access_key);

    next();
  } catch (error) {
    console.error("Verify token error:", error);
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        status: "Fail",
        message: "Invalid token",
        error: error.message,
      });
    } else {
      return res.status(500).json({
        status: "Fail",
        message: "Internal server error",
        error: error.message,
      });
    }
  }
};

module.exports = jwtVerifyToken;
