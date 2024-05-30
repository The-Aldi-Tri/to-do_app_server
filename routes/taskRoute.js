const express = require("express");
const taskRouter = express.Router();

const jwtVerifyToken = require("../middlewares/jwtAuthenticate");
const joiValidate = require("../middlewares/joiValidate");
const { createTaskSchema } = require("../schemas/taskSchema");
const taskController = require("../controllers/taskController");

taskRouter.post(
  "/",
  jwtVerifyToken,
  joiValidate(createTaskSchema),
  taskController.createTask
);
taskRouter.get("/", jwtVerifyToken, taskController.getTasks);
taskRouter.get("/:id", jwtVerifyToken, taskController.getTaskById);
taskRouter.put(
  "/toggle-finished/:id",
  jwtVerifyToken,
  taskController.toggleFinishedById
);
taskRouter.delete("/:id", jwtVerifyToken, taskController.deleteTaskById);

module.exports = taskRouter;
