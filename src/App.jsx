import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import "./App.css";

const server = "http://localhost:666";
// const server = "https://trusting-ten-pint.glitch.me/";
let socket;

function App() {
  const [socketId, setSocketId] = useState("");
  const [user, setUser] = useState("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState("");
  const [room, setRoom] = useState("");

  useEffect(() => {
    socket = io(server);

    socket.on("connect", () => {
      console.log("Connected to server");
    });

    socket.on("message", (data) => {
      console.log(data);
    });

    socket.on("new_client", (data) => {
      console.log(data);
    });

    // socket.on("welcome_to_room", (data) => {
    //   console.log(data);
    //   setMessages(data);
    // });

    socket.on("disconnect", (reason) => {
      console.log("Disconnected from server");
    });

    socket.on("new_message", (data) => {
      console.log(data);
      const updatedMess = [...messages, data];
      setMessages(updatedMess);
    });

    return () => socket.off();
    // setMessages(fromDaBase)
  }, []);

  function handleMessage(e) {
    e.preventDefault();
    const newMessage = {
      message: input,
      room: room,
      user: user,
      userId: socket.id,
    };
    if (input) {
      socket.emit("message", input, user, room);
      setMessages([...messages, newMessage]);
      setInput("");
    }
  }

  function handleDM() {
    socket.emit("direct_message", { message: "Hej där!", to: socketId });
  }

  function createRoom(roomName) {
    socket.emit("create_room", roomName);
    setRoom(roomName);
  }

  function joinRoom(roomName) {
    setRoom(roomName);
    socket.emit("join_room", roomName);
  }

  function leaveRoom(roomName) {
    socket.emit("leave_room", roomName);
  }

  return (
    <div className="App">
      <header className="App-header">
        <input
          placeholder="Username..."
          className="username"
          value={user}
          autoComplete="off"
          onChange={(e) => setUser(e.target.value)}
        />
        {/* <input
          className="socketId"
          value={socketId}
          onChange={(e) => setSocketId(e.target.value)}
        />
        <button onClick={handleDM}>Skicka direktmeddelande</button> */}
        <ul className="messages">
          {messages.map((message) => {
            return <li>{message.message}</li>;
          })}
        </ul>
        <form action="" className="messageForm">
          <input
            className="messageInput"
            autoComplete="off"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button onClick={handleMessage}>Skicka meddelande</button>
        </form>
        <input
          placeholder="Roomname..."
          value={room}
          onChange={(e) => setRoom(e.target.value)}
        />
        <button onClick={() => joinRoom(room)}>Join room</button>
        <button onClick={() => createRoom(room)}>Create room</button>
        <button onClick={() => leaveRoom("piri room")}>Lämna rum</button>
      </header>
    </div>
  );
}

export default App;
