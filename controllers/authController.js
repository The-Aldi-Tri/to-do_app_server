const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { access_key, refresh_key } = require("../config/jwtConfig");
const User = require("../models/userModel");

const generateAccessToken = (userId, expire) => {
  return jwt.sign({ userId }, access_key, { expiresIn: expire });
};

const generateRefreshToken = (userId, expire) => {
  return jwt.sign({ userId }, refresh_key, { expiresIn: expire });
};

const login = async (req, res) => {
  const { emailOrUsername, password, rememberMe } = req.body;

  try {
    // Find user by email or username
    const user = await User.findOne({
      $or: [{ username: emailOrUsername }, { email: emailOrUsername }],
    });

    // Handle if user not found
    if (!user)
      return res
        .status(404)
        .json({ status: "Fail", message: "User not found" });

    // Compare password
    const pwMatch = await bcrypt.compare(password, user.password);

    // Handle if password is incorrect
    if (!pwMatch)
      return res
        .status(401)
        .json({ status: "Fail", message: "Invalid password" });

    if (rememberMe) {
      // Generate access token and refresh token
      const accessToken = generateAccessToken(user._id, "15m");
      const refreshToken = generateRefreshToken(user._id, "7d");

      // Set access token and refresh token as HTTP-only cookie
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        maxAge: 15 * 60 * 1000, // Expire in 15 minutes
      });
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // Expire in 7 days
      });
    } else {
      const accessToken = generateAccessToken(user._id, "1h");

      // Not specify maxAge in cookie to make it session cookie (auto delete after browser/tab closed)
      res.cookie("accessToken", accessToken, { httpOnly: true });
    }

    res
      .status(200)
      .json({ status: "Success", message: "Login successful", data: user });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      status: "Fail",
      message: "Internal server error",
      error: error.message,
    });
  }
};

const refresh = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken)
    return res
      .status(401)
      .json({ status: "Fail", message: "Refresh token not provided" });

  try {
    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, refresh_key);

    // Generate a new access token
    const accessToken = generateAccessToken(decoded._id, "15m");

    // Send the new access token back to the client as cookie
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000, // Expire in 15 minutes
    });

    return res
      .status(200)
      .json({ status: "Success", message: "Refresh token successful" });
  } catch (error) {
    console.error("Refresh token error:", error);
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

const changePassword = async (req, res) => {
  const id = req.params.id;
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.findById(id);

    if (!user)
      return res
        .status(404)
        .json({ status: "Fail", message: "User not found" });

    const pwMatch = await bcrypt.compare(currentPassword, user.password);

    if (!pwMatch)
      return res
        .status(401)
        .json({ status: "Fail", message: "Invalid password" });

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password in the database
    user.password = hashedPassword;
    await user.save();

    // Send success response
    res
      .status(200)
      .json({ status: "Success", message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({
      status: "Fail",
      message: "Internal server error",
      error: error.message,
    });
  }
};

const logout = async (req, res) => {
  // Delete access token and refresh token from cookies
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  return res
    .status(200)
    .json({ status: "Success", message: "Logout successful" });
};

module.exports = { login, refresh, changePassword, logout };
