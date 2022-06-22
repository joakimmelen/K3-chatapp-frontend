import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import "./App.css";
import { getTime } from "./timeFunc";

const server = "http://localhost:666";
// const server = "https://trusting-ten-pint.glitch.me/";
let socket;

function App() {
  const [init, setInit] = useState("");
  const [socketId, setSocketId] = useState("");
  const [user, setUser] = useState("");
  const [username, setUsername] = useState("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState("");
  const [rooms, setRooms] = useState([]);
  const [room, setRoom] = useState("");
  const [roomInput, setRoomInput] = useState("");
  const [date, setDate] = useState();

  const messageRef = useRef();

  useEffect(() => {
    if (messageRef.current) {
      messageRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
      });
    }
  }, [messages]);

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

    socket.on("user_created", (data) => {
      setUser(data);
      console.log(`Logged in as ${data}`);
    });

    socket.on("user_error", (data) => {
      console.log(data);
    });

    socket.on("user_loggedin", (data) => {
      setUser(data);
      console.log(`Logged in as ${data}`);
    });

    socket.on("error_loggedin", (data) => {
      console.log(data);
    });

    socket.on("room_created", (data) => {
      setRoom(data);
    });

    socket.on("room_error", (data) => {
      console.log(data);
    });

    socket.on("error_remove_room", (data) => {
      console.log(data);
    });
    socket.on("welcome_to_room", (data) => {
      // setMessages((prevState) => [...prevState, data]);
      setMessages(data[0]);
      setRoom(data[1]);
    });

    socket.on("disconnect", (reason) => {
      console.log("Disconnected from server");
    });

    socket.on("new_message", (data) => {
      console.log(data);
      setMessages((prevState) => [...prevState, data]);
    });

    return () => socket.off();
    // setMessages(fromDaBase)
  }, []);

  useEffect(() => {
    setDate(getTime());
  }, [messages]);

  useEffect(() => {
    socket.on("all_rooms", (data) => {
      console.log(data);
    });
  }, [rooms]);

  function handleMessage() {
    const newMessage = {
      date: date,
      message: input,
      room: room,
      user: user,
      userId: socket.id,
    };
    if (input) {
      socket.emit("message", date, input, user, room);
      setMessages([...messages, newMessage]);
      setInput("");
    }
  }

  function handleDM() {
    socket.emit("direct_message", { message: "Hej där!", to: socketId });
  }

  function login() {
    setInit("login");
  }

  function createUser() {
    setInit("create");
  }

  function addUser() {
    if (username) socket.emit("create_user", username);
  }

  function loginUser() {
    if (username) socket.emit("login_user", username);
  }

  function createRoom(roomName) {
    if (roomInput) socket.emit("create_room", roomName);
  }

  function joinRoom(roomName) {
    if (roomName) socket.emit("join_room", roomName);
    console.log(roomName);
  }

  function leaveRoom(roomName) {
    socket.emit("leave_room", roomName);
    setRoom("");
  }

  function getRooms() {
    socket.emit("get_rooms");
  }

  function removeRoom(roomName) {
    socket.emit("remove_room", roomName);
  }

  if (!user && !init) {
    return (
      <div className="App">
        <header className="App-header">
          <button onClick={() => login()}>Login</button>
          <button onClick={() => createUser()}>Create user</button>
        </header>
      </div>
    );
  }

  if (!user && init == "login") {
    return (
      <div className="App">
        <header className="App-header">
          <input
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") loginUser();
            }}
            placeholder="Username..."
            className="username"
            value={username}
            autoComplete="off"
            onChange={(e) => setUsername(e.target.value)}
          />
          <button onClick={() => loginUser()}>Login</button>
        </header>
      </div>
    );
  }
  if (!user && init == "create") {
    return (
      <div className="App">
        <header className="App-header">
          <input
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") addUser();
            }}
            placeholder="Username..."
            className="username"
            value={username}
            autoComplete="off"
            onChange={(e) => setUsername(e.target.value)}
          />
          <button onClick={() => addUser()}>Create</button>
        </header>
      </div>
    );
  }
  if (user && !room) {
    return (
      <div className="App">
        <header className="App-header">
          <div className="headerboii">
            <h4 className="currentUser">
              Logged in as {user}
              <button onClick={() => leaveRoom(room)}>Logout</button>
            </h4>
          </div>
          <div className="inputRoom">
            <input
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") joinRoom(roomInput);
              }}
              tabIndex="0"
              placeholder="Roomname..."
              className="Roomname"
              value={roomInput}
              autoComplete="off"
              onChange={(e) => setRoomInput(e.target.value)}
            />
            <button onClick={() => joinRoom(roomInput)}>Join room</button>
            <button onClick={() => createRoom(roomInput)}>Create room</button>
          </div>
          <button onClick={() => getRooms()}>Show available rooms</button>

          <ul className="currentRooms">
            {rooms.map((room) => {
              return <li className="room">{room}</li>;
            })}
          </ul>
        </header>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        {/* <input
            className="socketId"
            value={socketId}
            onChange={(e) => setSocketId(e.target.value)}
          />
          <button onClick={handleDM}>Skicka direktmeddelande</button> */}
        <div className="headerboii">
          <h4 className="currentRoom">
            Chatting in room "{room}" as {user}
            <button onClick={() => leaveRoom(room)}>Leave</button>
          </h4>
        </div>
        <ul className="messages">
          {messages.map((message) => {
            // if (!message.user_name) {
            //   return (
            //     <li className="message">
            //       <h4>{message.user} You say:</h4>
            //       <h2>{message.message}</h2>
            //       <h5>{message.date}</h5>
            //     </li>
            //   );
            // } else {
            return (
              <li ref={messageRef} className="message">
                <h4>{message.user} says:</h4>
                <h2>{message.message}</h2>
                <h5>{message.date}</h5>
              </li>
            );
          })}
        </ul>

        <div className="messageForm">
          <input
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleMessage();
            }}
            className="messageInput"
            autoComplete="off"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button onClick={() => handleMessage()}>Send</button>
        </div>
      </header>
    </div>
  );
}

export default App;
