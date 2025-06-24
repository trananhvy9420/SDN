const mongoose = require("mongoose");
const Comment = require("./comment");
const schema = mongoose.Schema;
const playersSchema = new schema(
  {
    playerName: { type: String, require: true },
    image: { type: String, require: true },
    cost: { type: Number, require: true },
    isCaptain: { type: Boolean, default: false },
    information: { type: String, require: true },
    comments: [Comment.schema],
    team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", require: true },
    disable: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
const Player = mongoose.model("Player", playersSchema);
module.exports = Player;
