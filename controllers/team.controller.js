const Team = require("../models/team");
//Lay All Team
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
//Create Team
const createTeam = async (req, res) => {
  const { teamName } = req.body;
  try {
    const newTeamName = new Team({
      teamName: teamName,
    });
    const savedTeam = await newTeamName.save();
    const response = {
      message: "Create team successfully",
      team: {
        teamName: teamName,
      },
    };
    return res.status(201).json(response);
  } catch (error) {
    console.error("Registration Error: " + error);
    return res
      .status(500)
      .json({ message: "An error occurred during registration." });
  }
};
const findByID = async (req, res) => {
  const id = req.params.id;
  try {
    const foundedTeam = await Team.findById(id);
    if (!foundedTeam) {
      return res.status(404).json({ message: "Team not found with that ID" });
    }
    const response = {
      message: "Successfully found that team",
      data: foundedTeam,
    };
    return res.status(200).json(response);
  } catch (error) {
    console.log("Error fetching team by ID:", error);
    return res
      .status(500)
      .json({ message: "Server error or invalid ID format." });
  }
};

module.exports = {
  findAllTeam,
  createTeam,
  findByID,
};
