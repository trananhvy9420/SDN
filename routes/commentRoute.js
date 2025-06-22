const express = require("express");
const commentRoute = express.Router();
const comment = require("../models/comment");
const { query, body, param } = require("express-validator");
const {
  protectedRoute,
  isAdmin,
} = require("../middlewares/validation.middleware");
const CommentController = require("../controllers/comment.Controller");
commentRoute.get("/").get(protectedRoute, CommentController.fetchAllComment);
module.exports = commentRoute;
