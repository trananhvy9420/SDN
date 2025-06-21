const express = require("express");
const memberRouter = express.Router();
const member = require("../models/member");
const memberController = require("../controllers/auth.controller");
const {
  registerRules,
  validate,
} = require("../middlewares/validation.middleware");
memberRouter.route("/login").post(memberController.signIn);
memberRouter
  .route("/register")
  .post(registerRules(), validate, memberController.signUp);
module.exports = memberRouter;
