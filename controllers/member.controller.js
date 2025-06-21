const Member = require("../models/member");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  registerRules,
  validate,
  loginRules,
  protectedRoute,
  isAdmin,
} = require("../middlewares/validation.middleware");

const fetchUserProfile = async (req, res) => {
  const userProfile = req.member;
  res.status(200).json({
    message: "User profile fetched successfully",
    data: userProfile,
  });
};
const fetchAllMember = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const [member, totalRecords] = await Promise.all([
      Member.find({}).skip(skip).limit(limit),
      Member.countDocuments({}),
    ]);
    if (!member || member.length === 0) {
      return res.status(200).json({
        message: "No members found.",
        pagination: {
          limit: parseInt(req.query.limit) || 10,
          currentPage: 1,
          totalPages: 0,
          totalRecords: 0,
        },
      });
    }
    const totalPages = Math.ceil(totalRecords / limit);
    const response = {
      message: "Successfully fetched members.",
      data: member,
      pagination: {
        limit: limit,
        currentPage: page,
        totalPages: totalPages,
        totalRecords: totalRecords,
      },
    };
    return res.status(200).json(response);
  } catch (error) {
    console.log("Error fetching players:", error);
    return res
      .status(500)
      .json({ message: "Error fetching players from database." });
  }
};
module.exports = {
  fetchAllMember,
  fetchUserProfile,
};
