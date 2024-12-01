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

const login = async (req, res, next) => {
  const { email_or_username, password, remember_me } = req.body;

  try {
    // Find user by email or username
    const user = await User.findOne({
      $or: [{ username: email_or_username }, { email: email_or_username }],
    });

    // Handle if user not found
    if (!user) {
      res.locals.status = 404;
      res.locals.json = { message: "Email or Username not found" };
      return next();
    }

    // Compare password
    const pwMatch = await bcrypt.compare(password, user.password);

    // Handle if password is incorrect
    if (!pwMatch) {
      res.locals.status = 401;
      res.locals.json = { message: "Invalid password" };
      return next();
    }

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

    res.locals.status = 200;
    res.locals.json = { message: "Login successful", data: sanitizedUser };
    return next();
  } catch (err) {
    next(err);
  }
};

const refresh = async (req, res, next) => {
  const refreshToken = req.signedCookies["refreshToken"];

  if (!refreshToken) {
    res.locals.status = 401;
    res.locals.json = { message: "Refresh token not found" };
    return next();
  }

  try {
    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, refresh_key);

    // Generate a new access token
    const accessToken = generateAccessToken({ id: decoded.id });

    // Send the new access token back to the client as cookie
    res.cookie("accessToken", accessToken, cookiesConfig.accessToken);

    res.locals.status = 200;
    res.locals.json = { message: "Refresh token successful" };
    return next();
  } catch (err) {
    next(err);
  }
};

const changePassword = async (req, res, next) => {
  const id = req.decoded.id;

  if (!isValidObjectId(id)) {
    res.locals.status = 422;
    res.locals.json = { message: "Invalid user id" };
    return next();
  }

  const { current_password, new_password } = req.body;

  try {
    const user = await User.findById(id);

    if (!user) {
      res.locals.status = 404;
      res.locals.json = { message: "User not found" };
      return next();
    }

    const pwMatch = await bcrypt.compare(current_password, user.password);

    if (!pwMatch) {
      res.locals.status = 401;
      res.locals.json = { message: "Invalid password" };
      return next();
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Update user's password in the database
    user.password = hashedPassword;
    await user.save();

    res.locals.status = 200;
    res.locals.json = { message: "Password changed successfully" };
    return next();
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  // Delete access token and refresh token from cookies
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  res.locals.status = 200;
  res.locals.json = { message: "Logout successful" };
  return next();
};

const isValid = (req, res, next) => {
  res.locals.status = 200;
  res.locals.json = { message: "Token still valid" };
  return next();
};

module.exports = { login, refresh, changePassword, logout, isValid };
