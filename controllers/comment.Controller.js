const Comment = require("../models/comment");

const {
  registerRules,
  validate,
  loginRules,
  protectedRoute,
  isAdmin,
} = require("../middlewares/validation.middleware");
const fetchAllComment = async (req, res) => {
  const id = req.member;
  try {
    const allComment = await Comment.find({ author: id });
    if (!allComment || allComment.length === 0) {
      return res.status(404).json({ message: "No have comment" });
    }
    const response = {
      message: "Successfully fetching comment ",
      data: allComment,
    };
    return res.status(200).json(response);
  } catch (error) {}
};
module.exports = {
  fetchAllComment,
};
