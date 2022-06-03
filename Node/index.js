const app = require("express")();
const server = require("http").createServer(app);
const mongoose = require("mongoose");
const chatSchema = require("./model/chatSchema");
const roomSchema = require("./model/roomModel");
const userSchema = require("./model/userSchema");
const api = require("./api");
const db = "mongodb://localhost:27017/GROUP";
const bodyParser = require("body-parser");
const cors = require("cors");
mongoose
  .connect(db)
  .then(() => {
    console.log(`connected successfully`);
  })
  .catch((err) => console.log(`not successfully`));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/Find", api);

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", async (socket) => {
  socket.on("data", async (get) => {
    console.log("get", get);
    const RoomData = await roomSchema.findOne({
      room: get.room,
    });
    const find = await chatSchema.find({
      room_id: RoomData._id,
    });
    if (find) {
      io.emit("showingRoomMessage", find, data);
    } else {
      io.emit("data", data);
    }
  });

  socket.on("join_room", async (data) => {
    console.log("data", data);
    socket.join(data);
  });

  socket.on("send_message", async (message) => {
    socket.to(message.username).emit("receive_message", message);
    socket.to(message.room).emit("receive_message", message);
    socket.to(message.email).emit("receive_message", message);
    console.log("message.email", message.email);

    if (message.room) {
      const data = new roomSchema({
        room: message.room,
      });
      const Exits = await roomSchema.findOne({ room: message.room });
      if (!Exits) await data.save();
      console.log("Exits", Exits);
      console.log("message.room_id", Exits._id);
      if (message.email) {
        const userData = new userSchema({
          username: message.username,
          email: message.email,
        });
        const emailExits = await userSchema.findOne({ email: message.email });
        if (!emailExits) await userData.save();
        if (Exits && emailExits) {
          const chat = new chatSchema({
            username: message.username,
            message: message.message,
            room_id: Exits._id,
            user_id: emailExits._id,
          });
          await chat.save();
          console.log("chat", chat);
          io.emit("only for time", chat);
        }
      }
    }

    socket.on("disconnect", () => {
      console.log("USER disconnect");
    });
  });
});

server.listen(7000, () => {
  console.log("Port connected at 7000");
});
