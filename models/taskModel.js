const mongoose = require("mongoose");

// Define task schema
const taskSchema = new mongoose.Schema({
  createdAt: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  task: {
    type: String,
    required: true,
  },
  details: {
    type: String,
    default: "",
  },
  finished: {
    type: Boolean,
    default: false,
  },
});

// Create a compound unique index
taskSchema.index({ username: 1, createdAt: -1 }, { unique: true }); // 1 ascending, -1 descending order

// Create task model
const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
