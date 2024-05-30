const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { access_key, refresh_key } = require("../config/jwtConfig");
const User = require("../models/userModel");
const isValidObjectId = require("../utils/isValidObjectId");

const accessTokenExpire = 15 * 60; // 15 minutes in seconds
const refreshTokenExpireShort = 2 * 60 * 60; // 2 hours in seconds
const refreshTokenExpireLong = 7 * 24 * 60 * 60; // 7 days in seconds

const cookiesConfig = {
  accessToken: {
    httpOnly: true,
    maxAge: accessTokenExpire * 1000, // 15 minutes in milliseconds
    signed: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  },
  refreshTokenShort: {
    httpOnly: true,
    maxAge: refreshTokenExpireShort * 1000, // 2 hours in milliseconds
    signed: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  },
  refreshTokenLong: {
    httpOnly: true,
    maxAge: refreshTokenExpireLong * 1000, // 7 days in milliseconds
    signed: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  },
};

const generateAccessToken = (
  payload,
  secretOrPrivateKey = access_key,
  expire = accessTokenExpire
) => {
  return jwt.sign(payload, secretOrPrivateKey, { expiresIn: expire });
};

const generateRefreshToken = (
  payload,
  flag,
  secretOrPrivateKey = refresh_key,
  expireLong = refreshTokenExpireLong,
  expireShort = refreshTokenExpireShort
) => {
  return jwt.sign(payload, secretOrPrivateKey, {
    expiresIn: flag ? expireLong : expireShort,
  });
};

const login = async (req, res) => {
  const { email_or_username, password, remember_me } = req.body;

  try {
    // Find user by email or username
    const user = await User.findOne({
      $or: [{ username: email_or_username }, { email: email_or_username }],
    });

    // Handle if user not found
    if (!user)
      return res
        .status(404)
        .json({ status: "FAILED", message: "Email or Username not found" });

    // Compare password
    const pwMatch = await bcrypt.compare(password, user.password);

    // Handle if password is incorrect
    if (!pwMatch)
      return res
        .status(401)
        .json({ status: "FAILED", message: "Invalid password" });

    // Generate access token and refresh token
    const accessToken = generateAccessToken({ id: user._id });
    const refreshToken = generateRefreshToken({ id: user._id }, remember_me);

    // Set access token and refresh token as HTTP-only cookie
    res.cookie("accessToken", accessToken, cookiesConfig.accessToken);
    res.cookie(
      "refreshToken",
      refreshToken,
      remember_me
        ? cookiesConfig.refreshTokenLong
        : cookiesConfig.refreshTokenShort
    );

    // Delete user sensitive information
    const sanitizedUser = { ...user._doc };
    delete sanitizedUser.password;

    return res.status(200).json({
      status: "SUCCESS",
      message: "Login successful",
      data: sanitizedUser,
    });
  } catch (error) {
    console.error("Error logging in:", error);
    return res.status(500).json({
      status: "FAILED",
      message: "An unexpected error occurred",
    });
  }
};

const refresh = async (req, res) => {
  const refreshToken = req.signedCookies["refreshToken"];

  if (!refreshToken)
    return res
      .status(401)
      .json({ status: "FAILED", message: "Refresh token not found" });

  try {
    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, refresh_key);

    // Generate a new access token
    const accessToken = generateAccessToken({ id: decoded.id });

    // Send the new access token back to the client as cookie
    res.cookie("accessToken", accessToken, cookiesConfig.accessToken);

    return res
      .status(200)
      .json({ status: "SUCCESS", message: "Refresh token successful" });
  } catch (error) {
    switch (error.name) {
      case "TokenExpiredError":
        return res
          .status(401)
          .json({ status: "FAILED", message: "Refresh token has expired" });
      case "JsonWebTokenError":
        return res
          .status(401)
          .json({ status: "FAILED", message: "Refresh token is invalid" });
      case "NotBeforeError":
        return res.status(401).json({
          status: "FAILED",
          message: "Refresh token is not yet valid",
        });
      default:
        console.error("Error refreshing token:", error);
        return res.status(500).json({
          status: "FAILED",
          message: "An unexpected error occurred",
        });
    }
  }
};

const changePassword = async (req, res) => {
  const id = req.decoded.id;

  if (!isValidObjectId(id)) {
    return res
      .status(422)
      .json({ status: "FAILED", message: "Invalid user id" });
  }

  const { current_password, new_password } = req.body;

  try {
    const user = await User.findById(id);

    if (!user)
      return res
        .status(404)
        .json({ status: "FAILED", message: "User not found" });

    const pwMatch = await bcrypt.compare(current_password, user.password);

    if (!pwMatch)
      return res
        .status(401)
        .json({ status: "FAILED", message: "Invalid password" });

    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Update user's password in the database
    user.password = hashedPassword;
    await user.save();

    return res
      .status(200)
      .json({ status: "SUCCESS", message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({
      status: "FAILED",
      message: "An unexpected error occurred",
    });
  }
};

const logout = async (req, res) => {
  // Delete access token and refresh token from cookies
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  return res
    .status(200)
    .json({ status: "SUCCESS", message: "Logout successful" });
};

const isValid = (req, res) => {
  return res
    .status(200)
    .json({ status: "SUCCESS", message: "Token still valid" });
};

module.exports = { login, refresh, changePassword, logout, isValid };
