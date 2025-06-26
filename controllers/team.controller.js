const Team = require("../models/team");
const Player = require("../models/player");
//Lay All Team
const findAllTeam = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const queryCondition = { disable: { $ne: true } };
    const [team, totalRecords] = await Promise.all([
      Team.find(queryCondition).skip(skip).limit(limit),
      Team.countDocuments(queryCondition),
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
  if (teamName.length < 3 || teamName.length > 20) {
    return res
      .status(400)
      .json({ message: "Team name must be between 3 and 20 characters." });
  }
  try {
    const existingTeam = await Team.findOne({ teamName: teamName });
    if (existingTeam) {
      return res
        .status(400)
        .json({ message: "Team with this name already exists." });
    }
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
const updateTeam = async (req, res) => {
  const teamID = req.params.id;
  const { teamName } = req.body;
  try {
    const updatedTeam = await Team.findByIdAndUpdate(
      teamID,
      {
        teamName: teamName,
      },
      { new: true, runValidators: true }
    );
    if (!updatedTeam) {
      return res.status(404).json({ message: "Team not found." });
    }
    const response = {
      message: "Updated team successfully",
      data: updatedTeam,
    };
    return res.status(200).json(response);
  } catch (error) {
    console.error("Registration Error: " + error);
    return res
      .status(500)
      .json({ message: "An error occurred during registration." });
  }
};
const deleteTeam = async (req, res) => {
  const teamID = req.params.id;

  try {
    const updatedTeam = await Team.findByIdAndUpdate(
      teamID,
      { disable: true },
      { new: true } // Trả về document sau khi update
    );

    if (!updatedTeam) {
      return res.status(404).json({ message: "Team not found" });
    }

    return res.status(200).json({
      message: "Team disabled successfully",
      data: updatedTeam,
    });
  } catch (error) {
    console.error("Error disabling team: ", error);
    return res
      .status(500)
      .json({ message: "An error occurred while disabling the team." });
  }
};

module.exports = {
  findAllTeam,
  createTeam,
  findByID,
  updateTeam,
  deleteTeam,
};
