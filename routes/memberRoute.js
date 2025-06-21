const express = require("express");
const memberRouter = express.Router();
const member = require("../models/member");
const memberController = require("../controllers/auth.controller");
const {
  registerRules,
  validate,
  loginRules,
} = require("../middlewares/validation.middleware");
memberRouter.route("/login").post(loginRules(), memberController.signIn);
memberRouter
  .route("/register")
  .post(registerRules(), validate, memberController.signUp);
module.exports = memberRouter;
