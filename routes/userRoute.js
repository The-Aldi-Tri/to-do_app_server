const express = require("express");
const userRouter = express.Router();

const jwtAuthenticate = require("../middlewares/jwtAuthenticate");
const joiValidate = require("../middlewares/joiValidate");
const {
  registerSchema,
  emailReqSchema,
  checkAvailableSchema,
} = require("../schemas/userSchema");
const userController = require("../controllers/userController");

userRouter.post("/", joiValidate(registerSchema), userController.createUser);
userRouter.get("/", jwtAuthenticate, userController.getUserById);
userRouter.put("/", jwtAuthenticate, userController.editUserById);
userRouter.delete("/", jwtAuthenticate, userController.deleteUserById);
userRouter.post(
  "/send-verification-code",
  joiValidate(emailReqSchema),
  userController.sendVerificationCodeByEmail
);
userRouter.post(
  "/check-available",
  joiValidate(checkAvailableSchema),
  userController.checkAvailable
);

module.exports = userRouter;
