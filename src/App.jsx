import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import "./App.css";

const server = "http://localhost:666";
// const server = "https://trusting-ten-pint.glitch.me/";
let socket;

function App() {
  const [socketId, setSocketId] = useState("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState("");

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

    socket.on("disconnect", (reason) => {
      console.log("Disconnected from server");
    });

    return () => socket.off();
    // setMessages(fromDaBase)
  }, []);

  useEffect(() => {
    socket.on("messages", (data) => {
      setMessages([...messages, data]);
    });
  }, []);

  function handleMessage(e) {
    e.preventDefault();
    if (input) socket.emit("message", input);
    setInput("");
    console.log(messages);
  }

  function handleDM() {
    socket.emit("direct_message", { message: "Hej där!", to: socketId });
  }

  function joinRoom(roomName) {
    socket.emit("join_room", roomName);
  }

  function leaveRoom(roomName) {
    socket.emit("leave_room", roomName);
  }

  return (
    <div className="App">
      <header className="App-header">
        <input
          className="socketId"
          value={socketId}
          onChange={(e) => setSocketId(e.target.value)}
        />
        <button onClick={handleDM}>Skicka direktmeddelande</button>
        <ul className="messages">
          {messages.map((message) => {
            return <li key={message.id}>{message}</li>;
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
        <button onClick={() => joinRoom("piri room")}>Gå med i rum</button>
        <button onClick={() => leaveRoom("piri room")}>Lämna rum</button>
      </header>
    </div>
  );
}

export default App;
