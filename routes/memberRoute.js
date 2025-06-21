const express = require("express");
const memberRoute = express.Router();
const member = require("../models/member");
const memberController = require("../controllers/member.controller");
const { query, param } = require("express-validator");
const {
  registerRules,
  validate,
  loginRules,
  protectedRoute,
  isAdmin,
} = require("../middlewares/validation.middleware");
// memberRoute.route("/login").post(loginRules(), memberController.signIn);
// memberRoute
//   .route("/register")
//   .post(registerRules(), validate, memberController.signUp);
memberRoute.route("/me").get(protectedRoute, memberController.fetchUserProfile);
memberRoute
  .route("/fetchAllUser")
  .get(
    [
      query("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Page must be a positive number"),
      query("limit")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Limit must be a positive number"),
    ],
    protectedRoute,
    isAdmin,
    memberController.fetchAllMember
  );
memberRoute
  .route("/updateprofile/:id")
  .put(
    [param("id").notEmpty().withMessage("ID is required")],
    registerRules(),
    validate,
    protectedRoute,
    memberController.updateMember
  );
module.exports = memberRoute;
