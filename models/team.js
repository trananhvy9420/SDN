const mongoose = require("mongoose");
const schema = mongoose.Schema;
const teamSchema = new schema(
  {
    teamName: {
      type: String,
      required: true,
    },
    disable: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
const Team = mongoose.model("Team", teamSchema);
module.exports = Team;
