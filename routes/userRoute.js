const express = require("express");
const userRouter = express.Router();

const jwtAuthenticate = require("../middlewares/jwtAuthenticate");
const joiValidate = require("../middlewares/joiValidate");
const { registerSchema } = require("../schemas/userSchema");
const userController = require("../controllers/userController");

userRouter.post("/", joiValidate(registerSchema), userController.createUser);
userRouter.get("/", jwtAuthenticate, userController.getUserById);
userRouter.put("/", jwtAuthenticate, userController.editUserById);
userRouter.delete("/", jwtAuthenticate, userController.deleteUserById);

module.exports = userRouter;
