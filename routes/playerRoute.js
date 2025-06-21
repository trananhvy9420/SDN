const express = require("express");
const playerRoute = express.Router();
const player = require("../models/player");
const playerController = require("../controllers/player.controller");
const { query } = require("express-validator");
playerRoute
  .route("/getAll")
  .get(
    [
      query("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Page must be a positive integer"),
      query("limit")
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage("Limit must be between 1 and 100."),
    ],
    playerController.findAllPlayer
  );
playerRoute
  .route("/search")
  .get(
    [query("playerName").trim().notEmpty().withMessage("Name must be filled")],
    playerController.foundPlayer
  );
module.exports = playerRoute;
