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
const updateProfile = async (req, res) => {
  const memberId = req.member.id;
  const { name, YOB } = req.body;

  try {
    const updatedMember = await Member.findByIdAndUpdate(memberId, {
      name: name,
      YOB: YOB,
    });
    if (!updatedMember) {
      return res.status(404).json({ message: "Member not found." });
    }
    const response = {
      message: "Updated member successfully",
      data: {
        name: name,
        YOB: YOB,
      },
    };
    return res.status(200).json(response);
  } catch (error) {
    console.error("Updated Error: " + error);
    return res
      .status(500)
      .json({ message: "An error occurred during registration." });
  }
};
const updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const memberId = req.member.id;
  try {
    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({ message: "User not found." });
    }
    const isMatch = await bcrypt.compare(currentPassword, member.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Mật khẩu hiện tại không chính xác." });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    member.password = hashedPassword;
    await member.save();

    return res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("Update Password Error: " + error);
    return res
      .status(500)
      .json({ message: "An error occurred during password update." });
  }
};
module.exports = {
  fetchAllMember,
  fetchUserProfile,
  updateProfile,
  updatePassword,
};
