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
    const playerNameQuery = req.query.playerName;

    // Nếu không có query playerName thì trả về lỗi hoặc một mảng rỗng
    if (!playerNameQuery) {
      return res
        .status(400)
        .json({ message: "Player name query is required." });
    }

    // Tạo một biểu thức chính quy (regular expression) từ query của người dùng
    // 'i' ở đây là để tìm kiếm không phân biệt chữ hoa/thường (case-insensitive)
    // Ví dụ: tìm "m" sẽ khớp với "m" và "M"
    const regex = new RegExp(playerNameQuery, "i");

    // Sử dụng .find() để tìm tất cả các cầu thủ khớp
    // Sử dụng $regex để tìm kiếm những cầu thủ có tên chứa chuỗi ký tự được cung cấp
    const foundPlayers = await Player.find({ playerName: { $regex: regex } });

    const response = {
      message: "Successfully fetched players",
      data: foundPlayers, // Dữ liệu trả về bây giờ là một mảng
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
  const authorId = req.member._id; // Lấy ID của người dùng đang thực hiện request

  try {
    const player = await Player.findById(id);
    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }

    // --- BẮT ĐẦU THAY ĐỔI ---
    // Kiểm tra xem người dùng đã bình luận về cầu thủ này chưa.
    // Chúng ta sử dụng .find() để tìm trong mảng comments
    // và so sánh `comment.author` với `authorId`.
    // Dùng .toString() là quan trọng để đảm bảo so sánh ObjectId của Mongoose một cách chính xác.
    const existingComment = player.comments.find(
      (comment) => comment.author.toString() === authorId.toString()
    );

    // Nếu đã tìm thấy bình luận, trả về lỗi 409 (Conflict)
    if (existingComment) {
      return res
        .status(409)
        .json({ message: "You have already commented on this player." });
    }
    // --- KẾT THÚC THAY ĐỔI ---

    const newComment = {
      rating: req.body.rating,
      content: req.body.content,
      author: authorId,
    };

    // Logic còn lại của bạn để lưu comment
    // (Lưu ý: Đoạn mã gốc của bạn có vẻ tạo comment ở 2 nơi,
    // một là tạo instance 'a' và lưu riêng, hai là đẩy vào mảng player.comments.
    // Logic này được giữ nguyên theo yêu cầu ban đầu).
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
    // THAY ĐỔI DUY NHẤT NẰM Ở ĐÂY
    // Thêm .populate() để lấy thông tin chi tiết của tác giả trong mỗi comment
    const player = await Player.findById(id).populate({
      path: "comments.author", // Đường dẫn đến trường cần "lấp đầy"
      select: "name", // Chỉ lấy trường "name" (và _id) của tác giả cho gọn nhẹ
    });

    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }

    // Bây giờ, player.comments đã chứa đầy đủ thông tin tên của author
    const commentsWithAuthorDetails = player.comments;

    // Sửa lại: Dùng status 200 (OK) cho request GET thay vì 201 (Created)
    return res.status(200).json({
      message: "Find comments successfully",
      data: commentsWithAuthorDetails,
      // req.member là thông tin người đang gửi request, có thể giữ lại nếu cần
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
const deletePlayer = async (req, res) => {
  const id = req.params.playerId;
  try {
    const player = await Player.findByIdAndDelete(id);
    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }
    const response = {
      message: "Delete this player successfully",
      data: player,
    };
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error deleting player:", error);
    console.error("Message:", error.message);
    return res
      .status(500)
      .json({ message: "An internal server error occurred." });
  }
};
const findPlayerByName = async (req, res) => {
  const playerName = req.params.name;
  try {
    const player = await Player.find({ playerName: playerName });
    if (!player) {
      return res
        .status(404)
        .json({ message: "Player not found with that name." });
    }
    const response = {
      message: "Find successfully",
      data: player,
    };
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error finding comment:", error);
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
  fetchCommentWithPlayerID,
  deletePlayer,
};
