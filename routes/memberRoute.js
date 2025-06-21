const express = require("express");
const memberRoute = express.Router();
const member = require("../models/member");
const memberController = require("../controllers/auth.controller");
const {
  registerRules,
  validate,
  loginRules,
  protectedRoute,
  isAdmin,
} = require("../middlewares/validation.middleware");
memberRoute.route("/login").post(loginRules(), memberController.signIn);
memberRoute
  .route("/register")
  .post(registerRules(), validate, memberController.signUp);
memberRoute
  .route("/me")
  .get(protectedRoute, isAdmin, memberController.fetchUserProfile);
module.exports = memberRoute;
