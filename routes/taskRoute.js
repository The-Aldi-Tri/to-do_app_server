const express = require("express");
const taskRouter = express.Router();

const jwtVerifyToken = require("../middlewares/jwtVerifyToken");
const joiValidate = require("../middlewares/joiValidate");
const { createTaskSchema } = require("../schemas/taskSchema");
const taskController = require("../controllers/taskController");

taskRouter.post(
  "/create-task/:username",
  joiValidate(createTaskSchema),
  taskController.createTask
);
taskRouter.get(
  "/get-tasks/:username",
  jwtVerifyToken,
  taskController.getTasksByUsername
);
taskRouter.get("/get-task/:id", jwtVerifyToken, taskController.getTaskById);
taskRouter.put(
  "/toggle-finished/:id",
  jwtVerifyToken,
  taskController.toggleFinished
);
taskRouter.delete(
  "/delete-task/:id",
  jwtVerifyToken,
  taskController.deleteTaskById
);
// Probably not used in this project
//taskRouter.put("/edit-task/:id", jwtVerifyToken, taskController.editTaskById);

module.exports = taskRouter;
