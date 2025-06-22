const Player = require("../models/player");
const Comment = require("../models/comment");
const findAllPlayer = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const [players, totalRecords] = await Promise.all([
      Player.find({}).skip(skip).limit(limit),
      Player.countDocuments({}),
    ]);
    if (!players || players.length === 0) {
      return res.status(200).json({
        message: "No players found.",
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
      message: "Successfully fetched players.",
      data: players,
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
const foundPlayer = async (req, res) => {
  try {
    const playerName = req.query.playerName;
    const foundedPlayer = await Player.findOne({ playerName: playerName });
    const response = {
      message: "Successfully fetched players with that id",
      data: foundedPlayer,
    };
    return res.status(200).json(response);
  } catch (error) {
    console.log("Error fetching players:", error);
    return res
      .status(500)
      .json({ message: "Error fetching players from database." });
  }
};
const getPlayerById = async (req, res) => {
  try {
    const id = req.query.id;
    const player = await Player.findById(id);
    if (!player) {
      return res
        .status(404)
        .json({ message: "Player not found with that ID." });
    }
    return res.status(200).json({ message: "Player found", data: player });
  } catch (error) {
    console.log("Error fetching player by ID:", error);
    return res
      .status(500)
      .json({ message: "Server error or invalid ID format." });
  }
};
const createPlayer = async (req, res) => {
  const { playerName, image, cost, isCaptain, information, team } = req.body;
  try {
    const newPlayer = new Player({
      playerName: playerName,
      image: image,
      cost: cost,
      isCaptain: isCaptain,
      information: information,
      team: team,
    });
    const savedPlayer = await newPlayer.save();
    const response = {
      message: "Create player successfully",
      data: savedPlayer,
    };
    res.status(201).json(response);
  } catch (error) {
    console.log("Error creating player by ID:", error);
    return res
      .status(500)
      .json({ message: "Server error or invalid ID format." });
  }
};
const updatePlayer = async (req, res) => {
  const id = req.params.playerId;
  const updateData = {};
  const allowedFields = [
    "playerName",
    "image",
    "cost",
    "isCaptain",
    "information",
    "team",
  ];

  // Vòng lặp để chỉ lấy các trường được phép cập nhật
  for (const field of allowedFields) {
    // Chỉ thêm vào updateData nếu trường đó tồn tại trong req.body
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  }

  // Kiểm tra xem có dữ liệu để update không
  if (Object.keys(updateData).length === 0) {
    return res
      .status(400)
      .json({ message: "No valid fields provided for update." });
  }

  try {
    const updatedPlayer = await Player.findByIdAndUpdate(
      id,
      updateData, // <--- SỬA Ở ĐÂY: Truyền thẳng object updateData
      { new: true, runValidators: true }
    );

    if (!updatedPlayer) {
      return res.status(404).json({ message: "Player not found." });
    }

    const response = {
      message: "Updated player successfully",
      data: updatedPlayer,
    };
    return res.status(200).json(response);
  } catch (error) {
    console.log("Error updating player by ID:", error);
    // Xử lý lỗi cụ thể hơn
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid ID format." });
    }
    return res
      .status(500)
      .json({ message: "An internal server error occurred." });
  }
};
// const addComment = async (req, res) => {
//   const member = req.member;
//   const id = req.params.playerId;
//   try {
//     const player = await Player.findById(id);
//     if (!player) {
//       return res.status(404).json({ message: "Player not found" });
//     }
//     const a = {
//       rating: req.body.rating,
//       content: req.body.content,
//       author: req.member._id,
//     };
//     console.log(a);
//     const newComment = new Comment({
//       rating: req.body.rating,
//       content: req.body.content,
//       author: req.member._id,
//     });
//     const savedComment = await newComment.save();
//     player.comments.push(a);
//     const savedPlayer = await player.save();
//     const addedComment = savedPlayer.comments[savedPlayer.comments.length - 1];
//     return res.status(201).json({
//       message: "Comment added successfully!",
//       data: addedComment,
//     });
//   } catch (error) {
//     console.error("Error adding comment:", error);
//     return res
//       .status(500)
//       .json({ message: "An internal server error occurred." });
//   }
// };
const addComment = async (req, res) => {
  const id = req.params.playerId;

  try {
    const player = await Player.findById(id);
    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }

    const newComment = {
      rating: req.body.rating,
      content: req.body.content,
      author: req.member._id,
    };
    const a = new Comment({
      rating: req.body.rating,
      content: req.body.content,
      author: req.member._id,
    });
    const savedComment = await a.save();
    player.comments.push(newComment);

    const savedPlayer = await player.save();

    const addedComment = savedPlayer.comments[savedPlayer.comments.length - 1];

    return res.status(201).json({
      message: "Comment added successfully!",
      data: addedComment,
      comment: a,
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    console.error("Message:", error.message);
    return res
      .status(500)
      .json({ message: "An internal server error occurred." });
  }
};
module.exports = {
  findAllPlayer,
  foundPlayer,
  getPlayerById,
  updatePlayer,
  createPlayer,
  addComment,
};
