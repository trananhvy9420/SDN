const express = require("express");
const teamRoute = express.Router();
const team = require("../models/team");
const teamController = require("../controllers/team.controller");
const { query, param, body } = require("express-validator");
const {
  registerRules,
  validate,
  loginRules,
  protectedRoute,
  isAdmin,
} = require("../middlewares/validation.middleware");
teamRoute
  .route("/")
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
    teamController.findAllTeam
  );

teamRoute.route("/").post(protectedRoute, isAdmin, teamController.createTeam);
teamRoute
  .route("/:id")
  .get(
    [param("id").notEmpty().withMessage("ID must be required")],
    protectedRoute,
    isAdmin,
    teamController.findByID
  );
teamRoute
  .route("/:id")
  .put(
    [
      param("id").notEmpty().withMessage("ID must be required"),
      body("teamName")
        .trim()
        .notEmpty()
        .withMessage("Team Name must be required"),
    ],
    protectedRoute,
    isAdmin,
    teamController.updateTeam
  );
module.exports = teamRoute;
