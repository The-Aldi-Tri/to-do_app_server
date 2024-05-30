const mongoose = require("mongoose");

// Define task schema
const taskSchema = new mongoose.Schema({
  createdAt: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  task: {
    type: String,
    required: true,
  },
  details: {
    type: String,
    default: "", // Allows empty strings
  },
  finished: {
    type: Boolean,
    required: true,
  },
});

// Create a compound unique index
taskSchema.index({ createdAt: -1, userId: 1 }, { unique: true }); // 1 ascending, -1 descending order

// Create task model
const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
