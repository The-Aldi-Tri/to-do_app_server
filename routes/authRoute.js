const express = require("express");
const authRouter = express.Router();

const jwtVerifyToken = require("../middlewares/jwtVerifyToken");
const joiValidate = require("../middlewares/joiValidate");
const { loginSchema, changePasswordSchema } = require("../schemas/userSchema");
const authController = require("../controllers/authController");

authRouter.post("/login", joiValidate(loginSchema), authController.login);
authRouter.get("/refresh", authController.refresh);
authRouter.put(
  "/change-password/:id",
  jwtVerifyToken,
  joiValidate(changePasswordSchema),
  authController.changePassword
);
authRouter.delete("/logout", jwtVerifyToken, authController.logout);

module.exports = authRouter;
