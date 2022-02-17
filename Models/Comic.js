const mongoose = require("mongoose");

const Comic = mongoose.model("Comic", {
  thumbnail: { type: mongoose.Schema.Types.Mixed, default: {} },
  comics: Array,
  id: String,
  name: String,
  description: String,
});

module.exports = Comic;
