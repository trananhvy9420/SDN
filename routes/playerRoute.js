const express = require("express");
const playerRoute = express.Router();
const player = require("../models/player");
const playerController = require("../controllers/player.controller");
const { query, body, param } = require("express-validator");
const { validate } = require("../middlewares/validation.middleware");
const {
  protectedRoute,
  isAdmin,
} = require("../middlewares/validation.middleware");
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
playerRoute
  .route("/searchByID")
  .get(
    [query("id").trim().notEmpty().withMessage("Name must be filled")],
    playerController.getPlayerById
  );
playerRoute
  .route("/")
  .post(
    [
      body("playerName")
        .trim()
        .notEmpty()
        .withMessage("playerName must be required"),
      body("image").trim().notEmpty().withMessage("image must be required"),
      body("cost").trim().notEmpty().withMessage("cost must be required"),
      body("information")
        .trim()
        .notEmpty()
        .withMessage("information must be required"),
      body("isCaptain")
        .notEmpty()
        .isBoolean()
        .withMessage("isCaptain must be a boolean (true or false)"),

      body("team").trim().notEmpty().withMessage("team must be required"),
    ],
    validate,
    protectedRoute,
    isAdmin,
    playerController.createPlayer
  );
playerRoute
  .route("/:playerId")
  .put(
    [param("playerId").trim().notEmpty().withMessage("ID must be required")],
    validate,
    protectedRoute,
    isAdmin,
    playerController.updatePlayer
  );
playerRoute
  .route("/:playerId/add-comment")
  .post([
    [
      param("playerId").isMongoId().withMessage("Invalid Player ID format."),
      body("rating")
        .isInt({ min: 1, max: 3 })
        .withMessage("Rating must be a number between 1 and 3."),
      body("content").trim().notEmpty().withMessage("Content cannot be empty."),
    ],
    validate,
    protectedRoute,
    playerController.addComment,
  ]);
playerRoute
  .route("/:playerId/comment")
  .get([
    [param("playerId").isMongoId().withMessage("Invalid Player ID format.")],
    validate,
    protectedRoute,
    playerController.fetchCommentWithPlayerID,
  ]);
playerRoute
  .route("/:playerId/delete")
  .delete(
    [param("playerId").isMongoId().withMessage("Invalid Player ID format.")],
    validate,
    protectedRoute,
    playerController.deletePlayer
  );

module.exports = playerRoute;
