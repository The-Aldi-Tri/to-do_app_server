const express = require("express");
const authRouter = express.Router();

const jwtAuthenticate = require("../middlewares/jwtAuthenticate");
const joiValidate = require("../middlewares/joiValidate");
const { loginSchema, changePasswordSchema } = require("../schemas/userSchema");
const authController = require("../controllers/authController");

authRouter.post("/login", joiValidate(loginSchema), authController.login);
authRouter.get("/refresh", authController.refresh);
authRouter.put(
  "/change-password",
  jwtAuthenticate,
  joiValidate(changePasswordSchema),
  authController.changePassword
);
authRouter.delete("/logout", jwtAuthenticate, authController.logout);
authRouter.get("/is-valid", jwtAuthenticate, authController.isValid); // opposite of isExpired

module.exports = authRouter;
