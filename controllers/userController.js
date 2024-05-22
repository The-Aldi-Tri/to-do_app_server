const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const convertDateTimeToWIB = require("../utils/convertWIB");

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
      createdAt: convertDateTimeToWIB(new Date()),
    });

    // Save the user to the database
    const savedUser = await newUser.save();

    // Respond with success message
    return res.status(201).json({
      status: "Success",
      message: "User created successfully",
      data: {
        _id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email,
        createdAt: savedUser.createdAt,
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    // Handle validation error
    if (error.name === "ValidationError") {
      console.error("Error: Validation Error");
      return res.status(400).json({ message: "Validation Error" });

      // Handle duplicate username error
    } else if (error.code === 11000 && error.keyPattern.username === 1) {
      console.error("Error: Duplicate username");
      return res.status(400).json({ message: "Duplicate username" });

      // Handle duplicate email error
    } else if (error.code === 11000 && error.keyPattern.email === 1) {
      console.error("Error: Duplicate email");
      return res.status(400).json({ message: "Duplicate email" });

      // Handle other errors
    } else {
      console.error("Error saving user:", error);
      return res.status(500).json({ "Error creating user": error });
    }
  }
};

const getUserById = async (req, res) => {
  const id = req.params.id;
  try {
    const user = await User.findById(id).select("-password");

    if (!user)
      return res
        .status(404)
        .json({ status: "Fail", message: "User not found" });

    return res.status(200).json({
      status: "Success",
      message: "User found",
      data: user,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const editUserById = async (req, res) => {
  const id = req.params.id;
  const { username, email } = req.body;
  try {
    const user = await User.findById(id).select("-password");

    if (!user)
      return res
        .status(404)
        .json({ status: "Fail", message: "User not found" });

    user.username = username;
    user.email = email;
    await user.save();

    return res.status(200).json({
      status: "Success",
      message: "User edited successfully",
      data: user,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const deleteUserById = async (req, res) => {
  const id = req.params.id;
  try {
    const user = await User.findById(id).select("-password");

    if (!user)
      return res
        .status(404)
        .json({ status: "Fail", message: "User not found" });

    const deleted = await User.deleteOne({ _id: id });

    if (deleted.deletedCount === 1) {
      return res.status(200).json({
        status: "Success",
        message: "User deleted successfully",
      });
    } else {
      return res.status(400).json({
        status: "Fail",
        message: "Failed to delete user",
      });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = {
  createUser,
  getUserById,
  editUserById,
  deleteUserById,
};
