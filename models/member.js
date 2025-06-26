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
  YOB: {
    type: Date,
    required: false,
  },
  password: {
    type: String,
  },
  googleId: {
    type: String,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Member", memberSchema);
