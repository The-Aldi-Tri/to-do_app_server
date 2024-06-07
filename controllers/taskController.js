const Task = require("../models/taskModel");
const dateTimeToWIB = require("../utils/dateTimeToWIB");
const isValidObjectId = require("../utils/isValidObjectId");

const createTask = async (req, res) => {
  const userId = req.decoded.id;

  if (!isValidObjectId(userId)) {
    return res
      .status(422)
      .json({ status: "FAILED", message: "Invalid user id" });
  }

  const { task, details, finished } = req.body;

  try {
    const newTask = new Task({
      userId: userId,
      createdAt: dateTimeToWIB(new Date()),
      task: task,
      details: details,
      finished: finished,
    });

    const savedTask = await newTask.save();

    return res.status(201).json({
      status: "SUCCESS",
      message: "Task created successfully",
      data: savedTask,
    });
  } catch (err) {
    next(err);
  }
};

const getTasks = async (req, res) => {
  const userId = req.decoded.id;

  if (!isValidObjectId(userId)) {
    return res
      .status(422)
      .json({ status: "FAILED", message: "Invalid user id" });
  }

  try {
    const tasks = await Task.find({ userId: userId }).sort({ createdAt: -1 }); // -1 : descending order

    return res.status(200).json({
      status: "SUCCESS",
      message: "Tasks retrieved successfully",
      data: tasks,
    });
  } catch (err) {
    next(err);
  }
};

const getTaskById = async (req, res) => {
  const taskId = req.params.id;

  if (!isValidObjectId(taskId)) {
    return res
      .status(422)
      .json({ status: "FAILED", message: "Invalid task id" });
  }

  try {
    const task = await Task.findById(taskId);

    if (!task)
      return res
        .status(404)
        .json({ status: "FAILED", message: "Task not found" });

    return res.status(200).json({
      status: "SUCCESS",
      message: "Task retrieved successfully",
      data: task,
    });
  } catch (err) {
    next(err);
  }
};

const toggleFinishedById = async (req, res) => {
  const taskId = req.params.id;

  if (!isValidObjectId(taskId)) {
    return res
      .status(422)
      .json({ status: "FAILED", message: "Invalid task id" });
  }

  try {
    const toggledTask = await Task.findByIdAndUpdate(
      taskId,
      [{ $set: { finished: { $not: "$finished" } } }], // toggle finished value
      { new: true }
    );

    if (!toggledTask)
      return res
        .status(404)
        .json({ status: "FAILED", message: "Task not found" });

    return res.status(200).json({
      status: "SUCCESS",
      message: "Task(finished field) toggled successfully",
      data: toggledTask,
    });
  } catch (err) {
    next(err);
  }
};

const deleteTaskById = async (req, res) => {
  const taskId = req.params.id;

  if (!isValidObjectId(taskId)) {
    return res
      .status(422)
      .json({ status: "FAILED", message: "Invalid task id" });
  }

  try {
    const deletedTask = await Task.findByIdAndDelete(taskId);

    if (!deletedTask)
      return res
        .status(404)
        .json({ status: "FAILED", message: "Task not found" });

    return res.status(200).json({
      status: "SUCCESS",
      message: "Task deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  toggleFinishedById,
  deleteTaskById,
};
