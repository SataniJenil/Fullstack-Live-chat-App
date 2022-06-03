const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const roomSchema = new Schema(
  {
    room: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Room", roomSchema);
