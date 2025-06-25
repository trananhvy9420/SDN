const express = require("express");
const memberRoute = express.Router();
const member = require("../models/member");
const memberController = require("../controllers/member.controller");
const { query, param, body } = require("express-validator");
const {
  registerRules,
  validate,
  loginRules,
  protectedRoute,
  isAdmin,
} = require("../middlewares/validation.middleware");

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
  .route("/updateprofile")
  .put(validate, protectedRoute, memberController.updateProfile);
memberRoute
  .route("/updatepassword")
  .put(
    protectedRoute,
    [
      body("currentPassword")
        .notEmpty()
        .withMessage("Current password is required"),
      body("newPassword")
        .isLength({ min: 6 })
        .withMessage("New password must be at least 6 characters long"),
    ],
    validate,
    protectedRoute,
    memberController.updatePassword
  );
module.exports = memberRoute;
