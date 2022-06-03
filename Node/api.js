const express = require("express");
const app = express();
var router = express.Router();
const chatSchema = require("./model/chatSchema");
const roomSchema = require("./model/roomModel");
const user = require("./model/userSchema");

router.get("/findData", async (req, res) => {
  try {
    console.log("req.params.room,", req.query.room);
    const { room } = req.query;
    const find = await roomSchema.findOne({
      room: room,
    });
    if (!find) {
      return res.send("room not exits");
    }
    const user = await chatSchema.find({ room_id: find._id });
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post("/login", async (req, res) => {
  const ans = await user.findOne({ email: req.body.email });
  if (!ans) {
    let newUser = new user({
      username: req.body.username,
      email: req.body.email,
    });
    await newUser.save();
  }

  const room = await roomSchema.findOne({
    room: req.body.room,
  });
  if (!room) {
    let nwrRoom = new roomSchema({
      room: req.body.room,
    });
    await nwrRoom.save();
  } else {
    res.status(200).json({ success: true, message: "email is get", ans, room });
  }
});

module.exports = router;
