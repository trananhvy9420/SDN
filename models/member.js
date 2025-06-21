const mongoose = require("mongoose");
const schema = mongoose.Schema;
const memberSchema = new schema(
  {
    membername: { type: String, require: true },
    password: { type: String, require: true },
    name: { type: String, require: true },
    YOB: { type: Date, require: true },
    isAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);
const Member = mongoose.model("Member", memberSchema);
module.exports = Member;
