const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const User = require("../models/userModel");
const VerificationRecord = require("../models/verificationRecordModel");
const dateTimeToWIB = require("../utils/dateTimeToWIB");
const isValidObjectId = require("../utils/isValidObjectId");

const createUser = async (req, res, next) => {
  // Extract user data from request body
  const { username, email, password } = req.body;
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the saltRounds

    // Create a new user instance with hashed password
    const newUser = new User({
      username: username,
      email: email,
      password: hashedPassword, // Store hashed password
      createdAt: dateTimeToWIB(new Date()),
    });

    // Save the user to the database
    const createdUser = await newUser.save();

    // Exclude sensitive properties from the response
    const sanitizedUser = createdUser.toObject();
    delete sanitizedUser.password;

    // Respond with success message
    res.locals.status = 201;
    res.locals.json = {
      message: "User created successfully",
      data: sanitizedUser,
    };
    return next();
  } catch (err) {
    next(err);
  }
};

const getUserById = async (req, res, next) => {
  const userId = req.decoded.id;

  if (!isValidObjectId(userId)) {
    res.locals.status = 422;
    res.locals.json = { message: "Invalid user id" };
    return next();
  }

  try {
    const foundUser = await User.findById(userId).select({ password: 0 });

    if (!foundUser) {
      res.locals.status = 404;
      res.locals.json = { message: "User not found" };
      return next();
    }

    res.locals.status = 200;
    res.locals.json = { message: "User retrieved successfully" };
    return next();
  } catch (err) {
    next(err);
  }
};

const editUserById = async (req, res, next) => {
  const userId = req.decoded.id;

  if (!isValidObjectId(userId)) {
    res.locals.status = 422;
    res.locals.json = { message: "Invalid user id" };
    return next();
  }

  const updateData = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    }).select({ password: 0 });

    if (!updatedUser) {
      res.locals.status = 404;
      res.locals.json = { message: "User not found" };
      return next();
    }

    res.locals.status = 200;
    res.locals.json = { message: "User updated successfully" };
    return next();
  } catch (err) {
    next(err);
  }
};

const deleteUserById = async (req, res, next) => {
  const userId = req.decoded.id;

  if (!isValidObjectId(userId)) {
    res.locals.status = 422;
    res.locals.json = { message: "Invalid user id" };
    return next();
  }

  try {
    const deletedUser = await User.findByIdAndDelete(userId).select({
      password: 0,
    });

    if (!deletedUser) {
      res.locals.status = 404;
      res.locals.json = { message: "User not found" };
      return next();
    }

    res.locals.status = 200;
    res.locals.json = { message: "User deleted successfully" };
    return next();
  } catch (error) {
    next(error);
  }
};

const sendVerificationCodeByEmail = async (req, res, next) => {
  const { email } = req.body;
  const verification_code = Math.floor(
    100000 + Math.random() * 900000
  ).toString(); // 6-digit code

  // Create a Nodemailer transporter using Gmail
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Setup email data
  let mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Email Verification Code",
    text: `Your verification code is: ${verification_code}. This code only valid for 5 minutes.`,
  };

  try {
    // Send email
    await transporter.sendMail(mailOptions);

    // Store the verification code in the database
    await VerificationRecord.findOneAndUpdate(
      { email }, // Filter by email
      { verification_code, createdAt: Date.now() }, // Update code and reset createdAt
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    // Options:
    // upsert -> create record if not exist
    // setDefaultsOnInsert -> apply default value if record not exist
    // new -> return updated record

    res.locals.status = 200;
    res.locals.json = { message: "Verification code sent" };
    return next();
  } catch (err) {
    next(err);
  }
};

const checkAvailable = async (req, res, next) => {
  const { value } = req.body;

  try {
    // Find user by email or username
    const user = await User.findOne({
      $or: [{ username: value }, { email: value }],
    });

    if (user) {
      res.locals.status = 409;
      res.locals.json = {
        message: "This Email or Username are already in use",
      };
      return next();
    }

    res.locals.status = 409;
    res.locals.json = { message: "This Email or Username are available" };
    return next();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createUser,
  getUserById,
  editUserById,
  deleteUserById,
  sendVerificationCodeByEmail,
  checkAvailable,
};
