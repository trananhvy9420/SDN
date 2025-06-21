const express = require("express");
const authRoute = express.Router();
const member = require("../models/member");
const authController = require("../controllers/auth.controller");
const { query, body, param } = require("express-validator");
const {
  registerRules,
  validate,
  loginRules,
  protectedRoute,
  isAdmin,
} = require("../middlewares/validation.middleware");
authRoute.route("/").post(loginRules(), authController.signIn);
authRoute
  .route("/register")
  .post(registerRules(), validate, authController.signUp);
module.exports = authRoute;
