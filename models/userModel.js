const mongoose = require("mongoose");

const userModel = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
  },
});
module.exports = mongoose.model("Users", userModel);
