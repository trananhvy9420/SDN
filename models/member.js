// models/member.js

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const memberSchema = new Schema({
  membername: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    // Không bắt buộc nữa, vì user có thể đăng nhập bằng Google
    // required: true,
  },
  googleId: {
    // Thêm trường này
    type: String,
  },
  isAdmin: {
    type: Boolean,
    default: false, // Mặc định là false, có thể thay đổi sau này
  },
  // Thêm các trường khác nếu cần
  // ví dụ: avatar: { type: String }
});

module.exports = mongoose.model("Member", memberSchema);
