const mongoose = require("mongoose");
const uri = process.env.MONGO_URI;
const connect = mongoose.connect(uri);
module.exports = connect;
