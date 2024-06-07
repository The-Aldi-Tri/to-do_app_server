const bcrypt = require("bcrypt");
const User = require("../models/userModel");
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
    return res.status(201).json({
      status: "SUCCESS",
      message: "User created successfully",
      data: sanitizedUser,
    });
  } catch (err) {
    next(err);
  }
};

const getUserById = async (req, res, next) => {
  const userId = req.decoded.id;

  if (!isValidObjectId(userId)) {
    return res
      .status(422)
      .json({ status: "FAILED", message: "Invalid user id" });
  }

  try {
    const foundUser = await User.findById(userId).select({ password: 0 });

    if (!foundUser)
      return res
        .status(404)
        .json({ status: "FAILED", message: "User not found" });

    return res.status(200).json({
      status: "SUCCESS",
      message: "User retrieved successfully",
      data: foundUser,
    });
  } catch (err) {
    next(err);
  }
};

const editUserById = async (req, res, next) => {
  const userId = req.decoded.id;

  if (!isValidObjectId(userId)) {
    return res
      .status(422)
      .json({ status: "FAILED", message: "Invalid user id" });
  }

  const updateData = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    }).select({ password: 0 });

    if (!updatedUser)
      return res
        .status(404)
        .json({ status: "FAILED", message: "User not found" });

    return res.status(200).json({
      status: "SUCCESS",
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (err) {
    next(err);
  }
};

const deleteUserById = async (req, res, next) => {
  const userId = req.decoded.id;

  if (!isValidObjectId(userId)) {
    return res
      .status(422)
      .json({ status: "FAILED", message: "Invalid user id" });
  }

  try {
    const deletedUser = await User.findByIdAndDelete(userId).select({
      password: 0,
    });

    if (!deletedUser)
      return res
        .status(404)
        .json({ status: "FAILED", message: "User not found" });

    return res.status(200).json({
      status: "SUCCESS",
      message: "User deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createUser,
  getUserById,
  editUserById,
  deleteUserById,
};
