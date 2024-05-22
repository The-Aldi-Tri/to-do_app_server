const express = require("express");
const userRouter = express.Router();

const jwtVerifyToken = require("../middlewares/jwtVerifyToken");
const joiValidate = require("../middlewares/joiValidate");
const { registerSchema } = require("../schemas/userSchema");

const userController = require("../controllers/userController");

userRouter.post("/", joiValidate(registerSchema), userController.createUser);
userRouter.get("/:id", jwtVerifyToken, userController.getUserById);
userRouter.put("/:id", jwtVerifyToken, userController.editUserById);
userRouter.delete("/:id", jwtVerifyToken, userController.deleteUserById);

module.exports = userRouter;
