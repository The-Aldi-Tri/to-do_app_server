const Task = require("../models/taskModel");
const dateTimeToWIB = require("../utils/dateTimeToWIB");
const isValidObjectId = require("../utils/isValidObjectId");

const createTask = async (req, res, next) => {
  const userId = req.decoded.id;

  if (!isValidObjectId(userId)) {
    res.locals.status = 422;
    res.locals.json = { message: "Invalid user id" };
    return next();
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

    res.locals.status = 201;
    res.locals.json = { message: "Task created successfully", data: savedTask };
    return next();
  } catch (err) {
    next(err);
  }
};

const getTasks = async (req, res, next) => {
  const userId = req.decoded.id;

  if (!isValidObjectId(userId)) {
    res.locals.status = 422;
    res.locals.json = { message: "Invalid user id" };
    return next();
  }

  try {
    const tasks = await Task.find({ userId: userId }).sort({ createdAt: -1 }); // -1 : descending order

    res.locals.status = 200;
    res.locals.json = { message: "Tasks retrieved successfully", data: tasks };
    return next();
  } catch (err) {
    next(err);
  }
};

const getTaskById = async (req, res, next) => {
  const taskId = req.params.id;

  if (!isValidObjectId(taskId)) {
    res.locals.status = 422;
    res.locals.json = { message: "Invalid user id" };
    return next();
  }

  try {
    const task = await Task.findById(taskId);

    if (!task) {
      res.locals.status = 404;
      res.locals.json = { message: "Task not found" };
      return next();
    }

    res.locals.status = 200;
    res.locals.json = { message: "Task retrieved successfully", data: task };
    return next();
  } catch (err) {
    next(err);
  }
};

const toggleFinishedById = async (req, res, next) => {
  const taskId = req.params.id;

  if (!isValidObjectId(taskId)) {
    res.locals.status = 422;
    res.locals.json = { message: "Invalid user id" };
    return next();
  }

  try {
    const toggledTask = await Task.findByIdAndUpdate(
      taskId,
      [{ $set: { finished: { $not: "$finished" } } }], // toggle finished value
      { new: true }
    );

    if (!toggledTask) {
      res.locals.status = 404;
      res.locals.json = { message: "Task not found" };
      return next();
    }

    res.locals.status = 200;
    res.locals.json = {
      message: "Task(finished field) toggled successfully",
      data: toggledTask,
    };
    return next();
  } catch (err) {
    next(err);
  }
};

const deleteTaskById = async (req, res, next) => {
  const taskId = req.params.id;

  if (!isValidObjectId(taskId)) {
    res.locals.status = 422;
    res.locals.json = { message: "Invalid user id" };
    return next();
  }

  try {
    const deletedTask = await Task.findByIdAndDelete(taskId);

    if (!deletedTask) {
      res.locals.status = 404;
      res.locals.json = { message: "Task not found" };
      return next();
    }

    res.locals.status = 200;
    res.locals.json = { message: "Task deleted successfully" };
    return next();
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
