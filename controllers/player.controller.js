const Player = require("../models/player");
const Comment = require("../models/comment");
const Team = require("../models/team");
const findAllPlayer = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const queryCondition = { disable: { $ne: true } };
    const [players, totalRecords] = await Promise.all([
      Player.find(queryCondition).populate("team").skip(skip).limit(limit),
      // ------------------------------------
      Player.countDocuments(queryCondition),
    ]);
    if (!players || players.length === 0) {
      return res.status(200).json({
        message: "No players found.",
        pagination: {
          limit: parseInt(req.query.limit) || 10,
          currentPage: page,
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
    const playerNameQuery = req.query.playerName;
    if (!playerNameQuery) {
      return res
        .status(400)
        .json({ message: "Player name query is required." });
    }
    const regex = new RegExp(playerNameQuery, "i");

    const foundPlayers = await Player.find({
      playerName: { $regex: regex },
      disable: { $ne: true },
    });

    const response = {
      message: "Successfully fetched players",
      data: foundPlayers,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.log("Error fetching players:", error);
    return res
      .status(500)
      .json({ message: "Error fetching players from the database." });
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

const addComment = async (req, res) => {
  const id = req.params.playerId;
  const authorId = req.member.id;
  try {
    const player = await Player.findById(id);
    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }
    const existingComment = player.comments.find(
      (comment) => comment.author.toString() === authorId.toString()
    );

    if (existingComment) {
      return res
        .status(409)
        .json({ message: "You have already commented on this player." });
    }

    const newComment = {
      rating: req.body.rating,
      content: req.body.content,
      author: authorId,
    };

    const a = new Comment({
      rating: req.body.rating,
      content: req.body.content,
      author: authorId,
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
const fetchCommentWithPlayerID = async (req, res) => {
  const id = req.params.playerId;

  try {
    const player = await Player.findById(id).populate({
      path: "comments.author",
      select: "name",
    });

    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }

    const commentsWithAuthorDetails = player.comments;

    return res.status(200).json({
      message: "Find comments successfully",
      data: commentsWithAuthorDetails,

      requestingMember: req.member,
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    console.error("Message:", error.message);
    return res
      .status(500)
      .json({ message: "An internal server error occurred." });
  }
};
// const deletePlayer = async (req, res) => {
//   const id = req.params.playerId;
//   try {
//     const player = await Player.findByIdAndDelete(id);
//     if (!player) {
//       return res.status(404).json({ message: "Player not found" });
//     }
//     const response = {
//       message: "Delete this player successfully",
//       data: player,
//     };
//     return res.status(200).json(response);
//   } catch (error) {
//     console.error("Error deleting player:", error);
//     console.error("Message:", error.message);
//     return res
//       .status(500)
//       .json({ message: "An internal server error occurred." });
//   }
// };
const deletePlayer = async (req, res) => {
  const id = req.params.playerId;
  try {
    const updatedPlayer = await Player.findByIdAndUpdate(
      id,
      { disable: true },
      { new: true }
    );

    if (!updatedPlayer) {
      return res.status(404).json({ message: "Player not found" });
    }
    return res.status(200).json({
      message: "Team disabled successfully",
      data: updatedPlayer,
    });
  } catch (error) {
    console.error("Error disabling player: ", error);
    return res
      .status(500)
      .json({ message: "An error occurred while disabling the team." });
  }
};
const editComment = async (req, res) => {
  const { playerId, commentId } = req.params;

  const memberId = req.member.id;

  const { rating, content } = req.body;

  if (!rating && !content) {
    return res
      .status(400)
      .json({ message: "Cần cung cấp 'rating' hoặc 'content' để cập nhật." });
  }

  try {
    const updateFields = {};
    if (rating) {
      updateFields["comments.$.rating"] = rating;
    }
    if (content) {
      updateFields["comments.$.content"] = content;
    }

    const updatedPlayer = await Player.findOneAndUpdate(
      {
        _id: playerId,
        "comments._id": commentId,
        "comments.author": memberId, // QUAN TRỌNG: Chỉ cho phép tác giả của comment được sửa
      },
      {
        $set: updateFields,
      },
      {
        new: true, // Trả về document đã được cập nhật
        runValidators: true, // Chạy các validator của schema (ví dụ: min/max cho rating)
      }
    );

    if (!updatedPlayer) {
      return res.status(404).json({
        message: "Không tìm thấy bình luận hoặc bạn không có quyền chỉnh sửa.",
      });
    }
    const updatedComment = await Comment.findOneAndUpdate(
      { author: memberId },
      {
        rating: rating,
        content: content,
      },
      {
        new: true, // Trả về document đã được cập nhật
        runValidators: true, // Chạy các validator của schema (ví dụ: min/max cho rating)
      }
    );
    // Trả về thành công
    return res.status(200).json({
      message: "Chỉnh sửa bình luận thành công",
      data: updatedPlayer,
      updatedComment,
    });
  } catch (error) {
    console.error("Lỗi khi chỉnh sửa bình luận:", error);
    // Xử lý lỗi validation cụ thể
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: "Dữ liệu không hợp lệ.", details: error.message });
    }
    return res.status(500).json({ message: "Đã xảy ra lỗi máy chủ nội bộ." });
  }
};
module.exports = {
  findAllPlayer,
  foundPlayer,
  getPlayerById,
  updatePlayer,
  createPlayer,
  addComment,
  fetchCommentWithPlayerID,
  deletePlayer,
  editComment,
};
