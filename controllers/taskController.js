const Task = require("../models/taskModel");

const createTask = async (req, res) => {
  // Extract task data
  const username = req.params.username;
  const { createdAt, task, details, finished } = req.body;
  try {
    // Create a new task instance
    const newTask = new Task({
      username: username,
      createdAt: createdAt,
      task: task,
    });
    if (details) newTask = { ...newTask, details: details };
    if (finished !== undefined) newTask = { ...newTask, finished: finished };

    // Save the task to the database
    await newTask.save();

    // Respond with success message
    return res.status(201).json({
      status: "Success",
      message: "Task created successfully",
      data: newTask,
    });
  } catch (error) {
    console.error("Error saving task:", error);
    return res.status(500).json({
      status: "Fail",
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getTasksByUsername = async (req, res) => {
  const username = req.params.username;
  try {
    const tasks = await Task.find({ username: username });

    if (tasks.length === 0)
      return res
        .status(404)
        .json({ status: "fail", message: "Tasks not found" });

    return res.status(200).json({
      status: "Success",
      message: "Successfully getting tasks",
      data: tasks,
    });
  } catch (error) {
    console.error("Error getting tasks:", error);
    return res.status(500).json({
      status: "Fail",
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getTaskById = async (req, res) => {
  const id = req.params.id;
  try {
    const task = await Task.findById(id);

    if (!task)
      return res
        .status(404)
        .json({ status: "fail", message: "Task not found" });

    return res.status(200).json({
      status: "Success",
      message: "Successfully getting task",
      data: task,
    });
  } catch (error) {
    console.error("Error getting task:", error);
    return res.status(500).json({
      status: "Fail",
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Probably not used in this project
// const editTaskById = async (req, res) => {
//   const id = req.params.id;
//   const { task, details, finished } = req.body;
//   try {
//     const taskFound = await Task.findById(id);

//     if (!taskFound)
//       return res
//         .status(404)
//         .json({ status: "Fail", message: "Task not found" });

//     if (task) taskFound = { ...taskFound, task: task };
//     if (details) taskFound = { ...taskFound, details: details };
//     if (finished !== undefined)
//       taskFound = { ...taskFound, finished: finished };

//     await taskFound.save();

//     return res.status(200).json({
//       status: "Success",
//       message: "Successfully edited task",
//       data: taskFound,
//     });
//   } catch (error) {
//     console.error("Error editing task:", error);
//     return res.status(500).json({
//       status: "Fail",
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };

const toggleFinished = async (req, res) => {
  const id = req.params.id;
  try {
    const task = await Task.findById(id);

    if (!task)
      return res
        .status(404)
        .json({ status: "Fail", message: "Task not found" });

    const newFinished = !task.finished;
    task.finished = newFinished;

    await task.save();

    return res.status(200).json({
      status: "Success",
      message: "Successfully toggling finished",
      data: task,
    });
  } catch (error) {
    console.error("Error toggling finished:", error);
    return res.status(500).json({
      status: "Fail",
      message: "Internal server error",
      error: error.message,
    });
  }
};

const deleteTaskById = async (req, res) => {
  const id = req.params.id;
  try {
    const task = await Task.findById(id);

    if (!task)
      return res
        .status(404)
        .json({ status: "Fail", message: "Task not found" });

    const deleted = await Task.deleteOne({ _id: id });

    if (deleted.deletedCount === 1) {
      return res.status(200).json({
        status: "Success",
        message: "Task deleted successfully",
      });
    } else {
      return res.status(400).json({
        status: "Fail",
        message: "Failed to delete task",
      });
    }
  } catch (error) {
    console.error("Error deleting task:", error);
    return res.status(500).json({
      status: "Fail",
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  createTask,
  getTasksByUsername,
  getTaskById,
  toggleFinished,
  deleteTaskById,
};
