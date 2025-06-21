const Team = require("../models/team");
const findAllTeam = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const [team, totalRecords] = await Promise.all([
      Team.find({}).skip(skip).limit(limit),
      Team.countDocuments({}),
    ]);
    if (!team || team.length === 0) {
      return res.status(200).json({
        message: "No team found.",
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
      message: "Successfully fetched team.",
      data: team,
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
  findAllTeam,
};
