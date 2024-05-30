const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const dateTimeToWIB = require("../utils/dateTimeToWIB");
const isValidObjectId = require("../utils/isValidObjectId");

const createUser = async (req, res) => {
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
  } catch (error) {
    // Duplicate username error
    if (error.code === 11000 && error.keyPattern.username === 1) {
      return res
        .status(409)
        .json({ status: "FAILED", message: "This username is already in use" });
    }
    // Duplicate email error
    else if (error.code === 11000 && error.keyPattern.email === 1) {
      return res
        .status(409)
        .json({ status: "FAILED", message: "This email is already in use" });
    }
    // Handle other error
    else {
      console.error("Error creating user:", error);
      return res.status(500).json({
        status: "FAILED",
        message: "An unexpected error occurred",
      });
    }
  }
};

const getUserById = async (req, res) => {
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
  } catch (error) {
    console.error("Error retrieving user:", error);
    return res.status(500).json({
      status: "FAILED",
      message: "An unexpected error occurred",
    });
  }
};

const editUserById = async (req, res) => {
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
  } catch (error) {
    // Duplicate username error
    if (error.code === 11000 && error.keyPattern.username === 1) {
      return res
        .status(409)
        .json({ status: "FAILED", message: "This username is already in use" });
    }
    // Duplicate email error
    else if (error.code === 11000 && error.keyPattern.email === 1) {
      return res
        .status(409)
        .json({ status: "FAILED", message: "This email is already in use" });
    }
    // Handle other error
    else {
      console.error("Error updating user:", error);
      return res.status(500).json({
        status: "FAILED",
        message: "An unexpected error occurred",
      });
    }
  }
};

const deleteUserById = async (req, res) => {
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
    console.error("Error deleting user:", error);
    return res.status(500).json({
      status: "FAILED",
      message: "An unexpected error occurred",
      error: error.message,
    });
  }
};

module.exports = {
  createUser,
  getUserById,
  editUserById,
  deleteUserById,
};
