const express = require("express");
const teamRoute = express.Router();
const team = require("../models/team");
const teamController = require("../controllers/team.controller");
const { query } = require("express-validator");
teamRoute
  .route("/getAll")
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
    teamController.findAllTeam
  );
module.exports = teamRoute;
