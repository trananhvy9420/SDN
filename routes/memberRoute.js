const express = require("express");
const memberRoute = express.Router();
const member = require("../models/member");
const memberController = require("../controllers/auth.controller");
const {
  registerRules,
  validate,
  loginRules,
} = require("../middlewares/validation.middleware");
memberRoute.route("/login").post(loginRules(), memberController.signIn);
memberRoute
  .route("/register")
  .post(registerRules(), validate, memberController.signUp);
module.exports = memberRoute;
