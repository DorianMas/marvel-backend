const mongoose = require("mongoose");

const Character = mongoose.model("Character", {
  thumbnail: { type: mongoose.Schema.Types.Mixed, default: {} },
  _id: String,
  title: String,
  description: String,
});

module.exports = Character;
