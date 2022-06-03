import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";
const socket = io("http://localhost:7000");

function ChatBox() {
  const [inputFiled, setInputFiled] = useState([]);
  const [isChatting, setChatting] = useState(false);
  const [messageList, setMessageList] = useState([]);
  const [list, setList] = useState([]);

  useEffect(() => {
    socket.on("receive_message", (message) => {
      setMessageList([...messageList, message]);
      console.log("message", message);
    });
  }, [messageList]);

  useEffect(() => {
    socket.on("only for time", (chat) => {
      setList([...list, chat]);
      console.log("chat", chat);
    });
  }, [list]);

  const data = async () => {
    console.log("inputFiled.room", inputFiled.room);
    const get = await axios.get(`http://localhost:7000/Find/findData`, {
      params: { room: inputFiled.room },
    });
    const { data } = get;
    const { user } = data;
    // if (!user) {
    //   alert("room is not valid");
    //   console.log("room not valid ");
    // }
    setMessageList(user);
  };

  const checkEmail = async () => {
    console.log("1", inputFiled.room);
    console.log("2", inputFiled.email);
    console.log("3", inputFiled.username);

    let item = {
      email: inputFiled.email,
      username: inputFiled.username,
      room: inputFiled.room,
    };
    console.log("item", item);
    const api = await axios.post("http://localhost:7000/Find/login", item);
    const { data } = api;
    const { ans } = data;
    console.log("ans", ans);
  };

  const inputHandler = (e) => {
    setInputFiled({
      ...inputFiled,
      [e.target.name]: e.target.value,
    });
  };

  const enterRoom = (e) => {
    e.preventDefault();
    setChatting(true);

    data();
    socket.emit("join_room", inputFiled.room);
    console.log("inputFiled.data", inputFiled);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    console.log("inputFiled", inputFiled);
    socket.emit("send_message", { ...inputFiled, createdAt: Date.now() });
    setMessageList([...messageList, { ...inputFiled, createdAt: Date.now() }]);
    setInputFiled({ ...inputFiled, message: "" });
  };

  const createRoom = (e) => {
    e.preventDefault();
    setChatting(true);
    checkEmail();
  };

  const dateFun = (currentDate) => {
    const Dt = new Date(currentDate);
    var dd = Dt.getDate();
    var month = Dt.getMonth() + 1; //Be careful! January is 0 not 1
    var year = Dt.getFullYear();
    return `${dd}-${month}-${year}`;
  };

  const currentTime = (timestamp) => {
    const hour = timestamp.getHours();
    const minute = timestamp.getMinutes();
    return `${hour}:${minute}`;
  };
  return (
    <div>
      <h1>Socket</h1>
      {!isChatting ? (
        <div>
          <input
            type="text"
            placeholder="Enter Name"
            name="username"
            onChange={inputHandler}
          />
          <input
            type="text"
            placeholder="Enter Email"
            name="email"
            onChange={inputHandler}
          />
          <input
            type="text"
            placeholder="Enter Room"
            name="room"
            onChange={inputHandler}
          />
          <br />
          <br />
          <button onClick={enterRoom}>Enter Chat Room</button>
          <br />
          <button onClick={createRoom}>create new Chat Room</button>
        </div>
      ) : (
        <div>
          <h2>chat box</h2>
          {messageList.map((item, index) => {
            const todayDate = dateFun(new Date());
            const info = new Date(item.createdAt);
            const date = dateFun(info);
            const newDate = todayDate !== date ? date : currentTime(info);
            return (
              <div key={index}>
                {item.username}: {item.message} :{newDate}
              </div>
            );
          })}
          <input
            type="text"
            placeholder="Message"
            name="message"
            onChange={inputHandler}
            value={inputHandler.message}
          />

          <button onClick={sendMessage}>send a message</button>
        </div>
      )}
    </div>
  );
}

export default ChatBox;
