const Member = require("../models/member");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const signIn = async (req, res) => {
  const { membername, password } = req.body;
  if (!membername || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required." });
  }
  try {
    const member = await Member.findOne({ membername });

    if (!member) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const match = await bcrypt.compare(password, member.password);

    if (match) {
      const payload = {
        id: member._id,
        isAdmin: member.isAdmin,
      };

      const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "15m",
      });

      const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "7d",
      });

      return res.status(200).json({
        message: "Login successful!",
        accessToken: accessToken,
        refreshToken: refreshToken,
        member: {
          id: member._id,
          membername: member.membername,
          name: member.name,
          isAdmin: member.isAdmin,
        },
      });
    } else {
      return res.status(401).json({ message: "Invalid username or password" });
    }
  } catch (error) {
    console.error("Login Error: " + error);
    return res
      .status(500)
      .json({ message: "An error occurred on the server." });
  }
};
const signUp = async (req, res) => {
  const { membername, password, name, YOB } = req.body;
  try {
    const existingMember = await Member.findOne({ membername: membername });
    if (existingMember) {
      return res.status(400).json({ message: "Username is already existed" });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const newMember = new Member({
      membername: membername,
      password: hashedPassword,
      name: name,
      YOB: YOB,
    });
    const savedMember = await newMember.save();
    return res.status(201).json({
      message: "Member registered successfully!",
      member: {
        id: savedMember._id,
        membername: savedMember.membername,
        name: savedMember.name,
      },
    });
  } catch (error) {
    console.error("Registration Error: " + error);
    return res
      .status(500)
      .json({ message: "An error occurred during registration." });
  }
};
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
  signIn,
  signUp,
  fetchUserProfile,
  fetchAllMember,
};
