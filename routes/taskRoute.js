const express = require("express");
const taskRouter = express.Router();

const jwtAuthenticate = require("../middlewares/jwtAuthenticate");
const joiValidate = require("../middlewares/joiValidate");
const { createTaskSchema } = require("../schemas/taskSchema");
const taskController = require("../controllers/taskController");

taskRouter.post(
  "/",
  jwtAuthenticate,
  joiValidate(createTaskSchema),
  taskController.createTask
);
taskRouter.get("/", jwtAuthenticate, taskController.getTasks);
taskRouter.get("/:id", jwtAuthenticate, taskController.getTaskById);
taskRouter.put(
  "/toggle-finished/:id",
  jwtAuthenticate,
  taskController.toggleFinishedById
);
taskRouter.delete("/:id", jwtAuthenticate, taskController.deleteTaskById);

module.exports = taskRouter;
